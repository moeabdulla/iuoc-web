"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";
import { InteriorAtmosphere } from "./interior-atmosphere";
import { ReadyArtImage } from "./ready-art-image";
import { CourtyardArt } from "./art";
import { useEntranceMotion } from "@/lib/courtyard/use-entrance-motion";
import { useMotionPreference } from "@/lib/courtyard/use-motion-preference";

export function CourtyardEntrance({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const cancelScroll = useRef<() => void>(() => {});
  useEffect(() => () => cancelScroll.current(), []);
  const { reduced } = useMotionPreference();
  const [active, setActive] = useState(true);
  useEntranceMotion(root, reduced);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let visible = true;
    const update = () => setActive(visible && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  function enterLibrary() {
    cancelScroll.current();
    const target = document.getElementById("library-heading");
    if (!target) return;
    const top = Math.max(0, target.getBoundingClientRect().top + scrollY - 108);
    if (
      root.current?.closest<HTMLElement>(".courtyard-home")?.dataset
        .simpleEntrance === "true"
    ) {
      window.scrollTo({ top, behavior: reduced ? "instant" : "smooth" });
      target.focus({ preventScroll: true });
      return;
    }
    if (reduced) {
      window.scrollTo({ top });
      target.focus({ preventScroll: true });
      return;
    }
    const position = { y: window.scrollY };
    const stop = () => {
      tween.kill();
      cleanup();
    };
    const cleanup = () => {
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
    };
    const tween = gsap.to(position, {
      y: top,
      duration: 3.4,
      ease: "sine.inOut",
      onUpdate: () => window.scrollTo(0, position.y),
      onComplete: () => {
        cleanup();
        target.focus({ preventScroll: true });
      },
    });
    cancelScroll.current = stop;
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("keydown", stop);
  }
  // Start with the native layout in server markup. Safari samples the bottom
  // backdrop during reload, before effects run; briefly starting with a fixed
  // desktop backdrop can leave its toolbar opaque for the rest of that visit.
  // useEntranceMotion enables the desktop camera synchronously before paint.
  return (
    <div
      className="courtyard-home"
      data-simple-entrance="true"
      data-reduced={reduced}
      data-active={active}
    >
      <div className="courtyard-background" aria-hidden="true">
        <canvas className="courtyard-scene-canvas" />
        <div className="courtyard-room-image">
          <CourtyardArt
            name="interior-wide"
            widths={[960, 1920, 2800]}
            width={3548}
            height={1774}
            eager
          />
        </div>
      </div>
      <InteriorAtmosphere />
      <div
        ref={root}
        className="entrance-section"
        aria-label="Entering the library"
      >
        <div className="entrance-stage">
          <div className="entrance-curtain" aria-hidden="true">
            <div className="facade-plane">
              <picture>
                <source
                  media="(max-width:700px), (max-aspect-ratio:4/5)"
                  srcSet="/courtyard/facade-phone-640.webp 640w, /courtyard/facade-phone-1080.webp 1080w, /courtyard/facade-phone-1600.webp 1600w"
                />
                <ReadyArtImage
                  className="facade-image"
                  src="/courtyard/facade-1440.webp"
                  srcSet="/courtyard/facade-1440.webp 1440w, /courtyard/facade-2400.webp 2400w, /courtyard/facade-3200.webp 3200w"
                  sizes="100vw"
                  width="1774"
                  height="887"
                  alt=""
                  draggable={false}
                  fetchPriority="high"
                />
              </picture>
              <div className="facade-doors">
                <CourtyardArt
                  name="door-left"
                  widths={[240, 553, 1106]}
                  width={553}
                  height={1997}
                  className="door-left"
                  eager
                />
                <CourtyardArt
                  name="door-right"
                  widths={[240, 553, 1106]}
                  width={553}
                  height={1997}
                  className="door-right"
                  eager
                />
              </div>
              <div className="facade-ambient-light" />
            </div>
          </div>
          <div className="entrance-copy">
            <span className="courtyard-kicker" aria-hidden="true" />
            <h1>
              <span>Islamic knowledge,</span>
              <span>
                accessible to <em>everyone.</em>
              </span>
            </h1>
            <button onClick={enterLibrary} className="courtyard-button">
              Explore the library <ArrowRight size={20} aria-hidden="true" />
            </button>
          </div>
          <div
            className="entrance-foliage entrance-foliage-left"
            aria-hidden="true"
          >
            <div className="foliage-sway">
              <CourtyardArt
                name="near-foliage"
                widths={[480, 800, 1200]}
                width={1086}
                height={1448}
                eager
              />
            </div>
          </div>
          <div
            className="entrance-foliage entrance-foliage-right"
            aria-hidden="true"
          >
            <div className="foliage-sway">
              <CourtyardArt
                name="right-foliage"
                widths={[400, 800]}
                width={1086}
                height={1448}
                eager
              />
            </div>
          </div>
        </div>
      </div>
      <div className="courtyard-library" id="library">
        {children}
      </div>
    </div>
  );
}
