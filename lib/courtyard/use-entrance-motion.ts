"use client";
import { useLayoutEffect, type RefObject } from "react";
import {
  paintSceneLayer,
  measureSceneLayer,
  paintPersistentSceneLayer,
} from "./scene-layer";
import { createScenePainter } from "./scene-painter";
import { lockSceneViewport, sceneViewportChanged } from "./scene-viewport";
import geometry from "@/public/courtyard/geometry.json";
import {
  clamp01,
  entranceStageTop,
  DEPTH,
  ROOM_OVERSCAN,
  entranceLayout,
  entrancePose,
  entranceCamera,
  layerExitProgress,
  interiorPose,
  projectRect,
  entranceHasCleared,
  entranceClearProgress,
  type Rect,
  type SceneLayout,
} from "./entrance-scene";

/** One native scroll sampler owns every layer, including the entrance/reading
 * boundary and history restores. No disconnected trigger ranges or SVG clip
 * cache can leave the fixed photograph stuck at an old projection. */
export function useEntranceMotion(
  root: RefObject<HTMLDivElement | null>,
  reduced: boolean,
) {
  useLayoutEffect(() => {
    if (!root.current) return;
    const section: HTMLDivElement = root.current;
    const home = section.closest<HTMLElement>(".courtyard-home")!;
    // Keep the verified layer lifecycle on every return path, including links
    // such as /#library that intentionally contain no diagnostic query string.
    const comparison = new URLSearchParams(location.search).get(
      "courtyard-test",
    );
    const canvasRenderer =
      comparison !== "dom-layers" && comparison !== "retired-layers";
    const persistentLayers = comparison !== "retired-layers";
    const touchViewport = matchMedia("(hover:none) and (pointer:coarse)");
    const stableViewport =
      touchViewport.matches || comparison === "touch-viewport";
    home.dataset.stableViewport = String(stableViewport);
    home.dataset.sceneRenderer = canvasRenderer
      ? "canvas"
      : persistentLayers
        ? "persistent"
        : "retired";
    // One-variable diagnostic for the reported Chrome scroll-paint corruption.
    // This changes only the header backdrop filter, never the default design.
    home.dataset.noHeaderBlur = String(comparison === "no-blur");
    const stage = section.querySelector<HTMLElement>(".entrance-stage")!;
    const facade = section.querySelector<HTMLElement>(".facade-plane")!;
    const room = home.querySelector<HTMLElement>(".courtyard-room-image")!;
    const reading = home.querySelector<HTMLElement>(".courtyard-library")!;
    const doors = Array.from(
      section.querySelectorAll<HTMLElement>(".facade-doors img"),
    );
    const copy = section.querySelector<HTMLElement>(".entrance-copy")!;
    const plants = Array.from(
      section.querySelectorAll<HTMLElement>(".entrance-foliage"),
    );
    const portrait = matchMedia("(max-width:700px), (max-aspect-ratio:4/5)");
    let layout: SceneLayout,
      bases: Rect[] = [],
      doorBases: Rect[] = [],
      copyBase: Rect,
      boundary: number[][] = [],
      sectionTop = 0,
      travel = 1,
      readingTravel = 1,
      frame = 0,
      facadeExit = 1,
      copyExit = 1,
      viewportWidth = 0,
      sectionHeight = 0,
      plantExits: number[] = [];
    const painter = canvasRenderer ? createScenePainter(home, schedule) : null;
    function measure() {
      if (stableViewport && sceneViewportChanged(viewportWidth, innerWidth)) {
        viewportWidth = innerWidth;
        lockSceneViewport(home, stage, copy, touchViewport.matches);
      }
      if (!stage.clientWidth || !stage.clientHeight) return;
      const phone = portrait.matches;
      boundary = Array.from(
        geometry[phone ? "facade-phone" : "facade"].path.matchAll(
          /[ML]([\d.]+),([\d.]+)/g,
        ),
        (m) => [Number(m[1]), Number(m[2])],
      );
      layout = entranceLayout(
        stage.clientWidth,
        stage.clientHeight,
        geometry[phone ? "facade-phone" : "facade"],
        phone,
      );
      sectionTop = section.getBoundingClientRect().top + scrollY;
      travel = Math.max(1, section.offsetHeight - stage.offsetHeight);
      sectionHeight = section.offsetHeight;
      room.style.width = `${layout.width * ROOM_OVERSCAN}px`;
      room.style.height = `${layout.height * ROOM_OVERSCAN}px`;
      facade.style.width = `${layout.plane.width}px`;
      facade.style.height = `${layout.plane.height}px`;
      facade.style.left = `${layout.plane.x}px`;
      facade.style.transformOrigin = "0 0";
      measureSceneLayer(facade);
      const stageRect = stage.getBoundingClientRect();
      doorBases = doors.map((door) => {
        const r = door.getBoundingClientRect();
        return {
          x: r.x - stageRect.x,
          y: r.y - stageRect.y,
          width: r.width,
          height: r.height,
        };
      });
      const clearProgress = entranceClearProgress(layout, boundary, doorBases);
      facadeExit = clearProgress;
      // Start the card 24px of scrolling after the last door edge clears.
      reading.style.setProperty(
        "--library-overlap",
        `${(clearProgress - 1) * travel + 24}px`,
      );

      bases = [...plants, copy].map((el) => {
        measureSceneLayer(el);
        const r = el.getBoundingClientRect();
        return {
          x: r.x - stageRect.x,
          y: r.y - stageRect.y,
          width: r.width,
          height: r.height,
        };
      });
      copyBase = bases.pop()!;
      plantExits = bases.map((base, i) =>
        layerExitProgress(base, i === 0 ? DEPTH.leaves : DEPTH.pot, layout),
      );
      copyExit = layerExitProgress(copyBase, DEPTH.facade, layout);
      readingTravel = Math.max(
        layout.height,
        home.offsetHeight - section.offsetHeight,
      );
      copy.style.opacity = "1";
      render();
    }
    function place(
      el: HTMLElement,
      base: Rect,
      depth: number,
      camera: ReturnType<typeof entrancePose>["camera"],
    ) {
      const p = projectRect(base, depth, camera, layout.axis);
      if (painter?.isReady() && el !== copy) return p;
      // Cull offscreen surfaces rather than rasterising enormous texture tiles.
      const visible =
        p.visible &&
        p.x < layout.width &&
        p.y < layout.height &&
        p.x + p.width > 0 &&
        p.y + p.height > 0;
      el.style.transformOrigin = "0 0";
      if (persistentLayers) {
        paintPersistentSceneLayer(
          el,
          `translate(${p.x - base.x}px,${p.y - base.y}px) scale(${p.scale})`,
        );
        return p;
      }
      paintSceneLayer(
        el,
        visible,
        visible
          ? `translate(${p.x - base.x}px,${p.y - base.y}px) scale(${p.scale})`
          : "none",
      );
      return p;
    }
    function render() {
      frame = 0;
      if (!layout) return;
      const p = reduced ? 0 : clamp01((scrollY - sectionTop) / travel);
      const pose = entrancePose(p, layout);
      const readingProgress = reduced
        ? 0
        : clamp01((scrollY - sectionTop - travel) / readingTravel);
      const r =
        reduced || p >= 1
          ? interiorPose(readingProgress, layout).room
          : pose.room;
      const paintDOM = !painter?.isReady();
      if (paintDOM) {
        room.style.transformOrigin = "0 0";
        room.style.transform = `translate(${r.x}px,${r.y}px) scale(${r.scale})`;
      }
      const f = persistentLayers
        ? entrancePose(Math.min(p, facadeExit + 0.002), layout).facade
        : pose.facade;
      const passed = entranceHasCleared(p, layout, boundary, doorBases);
      const facadeTransform = `translate(${f.x - layout.plane.x}px,${f.y}px) scale(${f.scale})`;
      if (paintDOM) {
        if (persistentLayers)
          paintPersistentSceneLayer(facade, facadeTransform);
        else
          paintSceneLayer(facade, !passed, !passed ? facadeTransform : "none");
      }
      const plantRects = plants.map((el, i) =>
        place(
          el,
          bases[i],
          i === 0 ? DEPTH.leaves : DEPTH.pot,
          persistentLayers
            ? entranceCamera(Math.min(p, plantExits[i] + 0.002), layout)
            : pose.camera,
        ),
      );
      place(
        copy,
        copyBase,
        DEPTH.facade,
        persistentLayers
          ? entranceCamera(Math.min(p, copyExit + 0.002), layout)
          : pose.camera,
      );
      const interior = String(reduced || passed);
      if (home.dataset.interior !== interior) home.dataset.interior = interior;
      if (painter) {
        // These boxes supply geometry only; the canvas owns photographic paint.
        if (paintDOM)
          [facade, room, ...plants].forEach((el) => {
            el.style.willChange = "auto";
          });
        painter.paint({
          width: layout.width,
          height: layout.height,
          room: r,
          stage: {
            x: 0,
            y: entranceStageTop(scrollY, sectionTop, travel),
            width: layout.width,
            height: layout.height,
          },
          facade: f,
          doors: doorBases.map((base) =>
            projectRect(base, DEPTH.facade, pose.camera, layout.axis),
          ),
          plants: plantRects,
          entranceVisible: !passed,
        });
      }
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(render);
    }
    function remeasure() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = 0;
        measure();
      });
    }
    measure();
    const observer = new ResizeObserver((entries) => {
      // New lessons / quotes can change document height without changing the
      // camera. Do not reset all layer transforms and scan the arch for that.
      const homeEntry = entries.find((entry) => entry.target === home);
      if (homeEntry && layout)
        readingTravel = Math.max(
          layout.height,
          homeEntry.contentRect.height - sectionHeight,
        );
      if (entries.some((entry) => entry.target !== home)) remeasure();
      else schedule();
    });
    observer.observe(stage);
    observer.observe(copy);
    observer.observe(home);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("pageshow", remeasure);
    window.addEventListener("popstate", remeasure);
    window.addEventListener("hashchange", remeasure);
    portrait.addEventListener("change", remeasure);
    const onResize = () => {
      if (stableViewport && sceneViewportChanged(viewportWidth, innerWidth))
        remeasure();
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      painter?.dispose();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("pageshow", remeasure);
      window.removeEventListener("popstate", remeasure);
      window.removeEventListener("hashchange", remeasure);
      portrait.removeEventListener("change", remeasure);
      window.removeEventListener("resize", onResize);
      for (const name of [
        "--scene-height",
        "--scene-copy-top",
        "--scene-title-size",
      ])
        home.style.removeProperty(name);
    };
  }, [root, reduced]);
}
