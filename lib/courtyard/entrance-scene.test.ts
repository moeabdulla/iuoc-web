import { describe, it, expect } from "vitest";
import geometry from "../../public/courtyard/geometry.json";
import {
  DEPTH,
  entranceLayout,
  entrancePose,
  interiorPose,
  projectRect,
  portalHasPassed,
  entranceHasCleared,
  entranceClearProgress,
  layerExitProgress,
  entranceCamera,
  intersectsViewport,
} from "./entrance-scene";
const sizes = [
  [1920, 920],
  [1920, 1080],
  [3440, 1440],
  [2560, 1080],
  [1440, 900],
  [1280, 720],
  [768, 1024],
  [390, 844],
  [375, 680],
];
describe("one-camera entrance projection", () => {
  it.each(sizes)("keeps visible aperture covered at %i × %i", (w, h) => {
    const phone = w <= 700 || w / h <= 0.8,
      layout = entranceLayout(
        w,
        h,
        geometry[phone ? "facade-phone" : "facade"],
        phone,
      );
    for (let i = 0; i <= 200; i++) {
      const { aperture: a, room: r } = entrancePose(i / 200, layout);
      const visible = {
        left: Math.max(0, a.x),
        top: Math.max(0, a.y),
        right: Math.min(w, a.x + a.width),
        bottom: Math.min(h, a.y + a.height),
      };
      expect(r.x, `left edge at ${i}`).toBeLessThanOrEqual(visible.left + 0.1);
      expect(r.y, `top edge at ${i}`).toBeLessThanOrEqual(visible.top + 0.1);
      expect(r.x + r.width, `right edge at ${i}`).toBeGreaterThanOrEqual(
        visible.right - 0.1,
      );
      expect(r.y + r.height, `bottom edge at ${i}`).toBeGreaterThanOrEqual(
        visible.bottom - 0.1,
      );
    }
  });
  it("keeps the interior moving until the end and gives near planes greater parallax", () => {
    const layout = entranceLayout(1920, 920, geometry.facade, false);
    let previous = 0;
    for (let i = 1; i <= 100; i++) {
      const pose = entrancePose(i / 100, layout);
      if (i > 2) expect(pose.room.scale).toBeGreaterThan(previous);
      expect(pose.facade.scale).toBeGreaterThanOrEqual(pose.room.scale);
      previous = pose.room.scale;
    }
    const pose = entrancePose(0.4, layout),
      r = { x: 0, y: 500, width: 400, height: 500 };
    expect(
      projectRect(r, DEPTH.leaves, pose.camera, layout.axis).scale,
    ).toBeGreaterThan(
      projectRect(r, DEPTH.pot, pose.camera, layout.axis).scale,
    );
  });
  it("returns identical poses for a restored scroll position without time-based replay", () => {
    const layout = entranceLayout(1920, 920, geometry.facade, false);
    for (const p of [0, 0.2, 0.5, 0.85, 1]) {
      const before = entrancePose(p, layout);
      entrancePose(1, layout);
      expect(entrancePose(p, layout)).toEqual(before);
    }
  });
});

describe("continuous hall after the door", () => {
  it.each(sizes)("joins without a projection jump at %i × %i", (w, h) => {
    const phone = w <= 700 || w / h <= 0.8;
    const layout = entranceLayout(
      w,
      h,
      geometry[phone ? "facade-phone" : "facade"],
      phone,
    );
    expect(interiorPose(0, layout).room).toEqual(entrancePose(1, layout).room);
  });
  it.each(sizes)(
    "preserves coverage and a centred continuous zoom at %i × %i",
    (w, h) => {
      const phone = w <= 700 || w / h <= 0.8;
      const layout = entranceLayout(
        w,
        h,
        geometry[phone ? "facade-phone" : "facade"],
        phone,
      );
      const start = interiorPose(0, layout).room;
      for (let i = 0; i <= 100; i++) {
        const pose = interiorPose(i / 100, layout),
          r = pose.room;
        expect(r.x).toBeLessThanOrEqual(0);
        expect(r.y).toBeLessThanOrEqual(0);
        expect(r.x + r.width).toBeGreaterThanOrEqual(w);
        expect(r.y + r.height).toBeGreaterThanOrEqual(h);
        expect(r.scale / start.scale).toBeLessThan(1.18);
        expect(r.x + r.width / 2).toBeCloseTo(w / 2, 6);
        expect(r.y + r.height / 2).toBeCloseTo(h / 2, 6);
      }
    },
  );
});

it("keeps moving immediately after the entrance boundary", () => {
  const layout = entranceLayout(1440, 900, geometry.facade, false);
  expect(interiorPose(0.001, layout).room.scale).toBeGreaterThan(
    interiorPose(0, layout).room.scale,
  );
  expect(interiorPose(0.1, layout).room.scale).toBeGreaterThan(
    interiorPose(0.05, layout).room.scale,
  );
});

it.each(sizes)(
  "only culls the doorway after its arch has passed at %i × %i",
  (w, h) => {
    const phone = w <= 700 || w / h <= 0.8,
      g = geometry[phone ? "facade-phone" : "facade"];
    const layout = entranceLayout(w, h, g, phone);
    const polygon = Array.from(
      g.path.matchAll(/[ML]([\d.]+),([\d.]+)/g),
      (m) => [Number(m[1]), Number(m[2])],
    );
    expect(portalHasPassed(entrancePose(0, layout).facade, w, h, polygon)).toBe(
      false,
    );
    expect(portalHasPassed(entrancePose(1, layout).facade, w, h, polygon)).toBe(
      true,
    );
  },
);

it("keeps the open door leaves visible after the empty arch has cleared", () => {
  const w = 1440,
    h = 900,
    layout = entranceLayout(w, h, geometry.facade, false);
  const g = geometry.facade;
  const polygon = Array.from(g.path.matchAll(/[ML]([\d.]+),([\d.]+)/g), (m) => [
    Number(m[1]),
    Number(m[2]),
  ]);
  const doors = [0.5305, 0.7415].map((x) => ({
    x: layout.plane.x + x * layout.plane.width,
    y: 0.31 * layout.plane.height,
    width: 0.056 * layout.plane.width,
    height: 0.505 * layout.plane.height,
  }));
  const p = 630 / 855;
  expect(portalHasPassed(entrancePose(p, layout).facade, w, h, polygon)).toBe(
    true,
  );
  expect(entranceHasCleared(p, layout, polygon, doors)).toBe(false);
  const clear = entranceClearProgress(layout, polygon, doors);
  expect(clear).toBeGreaterThan(p);
  expect(entranceHasCleared(clear - 0.001, layout, polygon, doors)).toBe(false);
  expect(entranceHasCleared(clear + 0.001, layout, polygon, doors)).toBe(true);
});

it.each(sizes)(
  "parks foreground layers outside %i × %i before reusing them",
  (w, h) => {
    const phone = w <= 700 || w / h <= 0.8;
    const layout = entranceLayout(
      w,
      h,
      geometry[phone ? "facade-phone" : "facade"],
      phone,
    );
    const base = { x: -50, y: h * 0.6, width: w * 0.28, height: h * 0.6 };
    const exit = layerExitProgress(base, DEPTH.leaves, layout);
    expect(exit).toBeGreaterThan(0);
    const parked = projectRect(
      base,
      DEPTH.leaves,
      entranceCamera(Math.min(1, exit + 0.002), layout),
      layout.axis,
    );
    expect(parked.visible && intersectsViewport(parked, w, h)).toBe(false);
  },
);
