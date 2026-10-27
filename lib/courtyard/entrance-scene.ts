/**
 * A small 2.5D scene: all art is projected by ONE dolly/pan, rather than
 * independently scaled or faded. Distances are relative scene units.
 * A photograph is still a plane, not a reconstructed volumetric room.
 */
export type Rect = { x: number; y: number; width: number; height: number };
export type PortalGeometry = {
  width: number;
  height: number;
  bounds: number[];
};
export const ROOM_OVERSCAN = 1.08;
export const DEPTH = { leaves: 0.38, pot: 0.72, facade: 1, room: 3.6 } as const;
export const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
export const smooth = (n: number) => {
  const t = clamp01(n);
  return t * t * (3 - 2 * t);
};
export function entranceLayout(
  width: number,
  height: number,
  g: PortalGeometry,
  phone: boolean,
) {
  const planeWidth = Math.max(
    width,
    ((height + (phone ? 70 : 0)) * g.width) / g.height,
  );
  const planeHeight = (planeWidth * g.height) / g.width;
  const plane: Rect = {
    x: (width - planeWidth) / 2,
    y: 0,
    width: planeWidth,
    height: planeHeight,
  };
  const [x1, y1, x2, y2] = g.bounds;
  const aperture: Rect = {
    x: plane.x + x1 * planeWidth,
    y: y1 * planeHeight,
    width: (x2 - x1) * planeWidth,
    height: (y2 - y1) * planeHeight,
  };
  return {
    width,
    height,
    plane,
    aperture,
    axis: {
      x: aperture.x + aperture.width / 2,
      y: aperture.y + aperture.height / 2,
    },
  };
}
export type SceneLayout = ReturnType<typeof entranceLayout>;
export function entranceCamera(progress: number, layout: SceneLayout) {
  const travel = smooth((clamp01(progress) - 0.015) / 0.985);
  const z = 0.94 * travel;
  // Reframe toward the doorway before we reach it. This same pan applies to
  // EVERY depth plane; it isn't a separate movement of the pots or door.
  const pan = smooth(z / 0.65);
  return {
    z,
    x: layout.axis.x + (layout.width / 2 - layout.axis.x) * pan,
    y: layout.axis.y + (layout.height / 2 - layout.axis.y) * pan,
  };
}
export function projectRect(
  rect: Rect,
  depth: number,
  camera: ReturnType<typeof entranceCamera>,
  axis: SceneLayout["axis"],
) {
  const remaining = depth - camera.z;
  const visible = remaining > 0.025;
  const scale = depth / Math.max(0.025, remaining);
  return {
    x: camera.x + (rect.x - axis.x) * scale,
    y: camera.y + (rect.y - axis.y) * scale,
    width: rect.width * scale,
    height: rect.height * scale,
    scale,
    visible,
  };
}
export function entrancePose(progress: number, layout: SceneLayout) {
  const camera = entranceCamera(progress, layout);
  const facade = projectRect(layout.plane, DEPTH.facade, camera, layout.axis);
  const aperture = projectRect(
    layout.aperture,
    DEPTH.facade,
    camera,
    layout.axis,
  );
  // A full viewport, centred behind the opening, has the overscan that was
  // missing from the earlier tiny room. It continues approaching throughout.
  const room = projectRoom(camera, layout);
  return { camera, facade, aperture, room };
}

function projectRoom(
  camera: ReturnType<typeof entranceCamera>,
  layout: SceneLayout,
) {
  return projectRect(
    {
      x: layout.axis.x - (layout.width * ROOM_OVERSCAN) / 2,
      y: layout.axis.y - (layout.height * ROOM_OVERSCAN) / 2,
      width: layout.width * ROOM_OVERSCAN,
      height: layout.height * ROOM_OVERSCAN,
    },
    DEPTH.room,
    camera,
    layout.axis,
  );
}

/** One unchanged hall after the doorway, with a small shared camera advance. */
export function interiorPose(progress: number, layout: SceneLayout) {
  const q = clamp01(progress),
    start = entranceCamera(1, layout);
  const camera = {
    ...start,
    z: start.z + 0.38 * q,
    x: start.x,
  };
  return { room: projectRoom(camera, layout) };
}

/** Cull the facade only after the actual arch (not just its rectangular bounds)
 * contains all four viewport corners, with a small offscreen margin. */
export function portalHasPassed(
  plane: Rect,
  width: number,
  height: number,
  polygon: number[][],
) {
  function contains(x: number, y: number) {
    const px = (x - plane.x) / plane.width,
      py = (y - plane.y) / plane.height;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i],
        [xj, yj] = polygon[j];
      if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi)
        inside = !inside;
    }
    return inside;
  }
  return [
    [-8, -8],
    [width + 8, -8],
    [-8, height + 8],
    [width + 8, height + 8],
  ].every(([x, y]) => contains(x, y));
}

export function intersectsViewport(rect: Rect, width: number, height: number) {
  return (
    rect.x < width + 8 &&
    rect.y < height + 8 &&
    rect.x + rect.width > -8 &&
    rect.y + rect.height > -8
  );
}
/** An open door extends inside the arch. Both have to pass before the whole
 * facade can be retired or the first reading card can enter. */
export function entranceHasCleared(
  progress: number,
  layout: SceneLayout,
  boundary: number[][],
  doors: Rect[],
) {
  const pose = entrancePose(progress, layout);
  return (
    portalHasPassed(pose.facade, layout.width, layout.height, boundary) &&
    doors.every(
      (door) =>
        !intersectsViewport(
          projectRect(door, DEPTH.facade, pose.camera, layout.axis),
          layout.width,
          layout.height,
        ),
    )
  );
}
export function entranceClearProgress(
  layout: SceneLayout,
  boundary: number[][],
  doors: Rect[],
) {
  let low = 0,
    high = 1;
  for (let i = 0; i < 22; i++) {
    const mid = (low + high) / 2;
    if (entranceHasCleared(mid, layout, boundary, doors)) high = mid;
    else low = mid;
  }
  return high;
}

/** First point where a foreground plane has entirely left the view. Keeping a
 * plane parked just beyond here avoids rebuilding it during a quick reversal. */
export function layerExitProgress(
  base: Rect,
  depth: number,
  layout: SceneLayout,
) {
  let low = 0,
    high = 1;
  for (let i = 0; i < 22; i++) {
    const mid = (low + high) / 2;
    const rect = projectRect(
      base,
      depth,
      entranceCamera(mid, layout),
      layout.axis,
    );
    if (rect.visible && intersectsViewport(rect, layout.width, layout.height))
      low = mid;
    else high = mid;
  }
  return high;
}
