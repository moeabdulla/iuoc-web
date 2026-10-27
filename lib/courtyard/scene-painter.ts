import type { Rect } from "./entrance-scene";
import { visibleImageCrop } from "./scene-image";
import { createGPUScenePainter } from "./gpu-scene-painter";

/** Paint a source crop directly from the camera's geometry. No layout/style
 * reads, or transformed DOM surfaces, are needed to produce a scroll frame. */
export function drawVisibleImage(
  context: CanvasRenderingContext2D,
  bitmap: ImageBitmap,
  box: Rect,
  viewportWidth: number,
  viewportHeight: number,
  cover = false,
) {
  const crop = visibleImageCrop(
    bitmap.width,
    bitmap.height,
    box,
    viewportWidth,
    viewportHeight,
    cover,
  );
  if (!crop) return;
  const [sx, sy, sw, sh] = crop.source;
  const [x, y, width, height] = crop.destination;
  context.drawImage(
    bitmap,
    sx * bitmap.width,
    sy * bitmap.height,
    sw * bitmap.width,
    sh * bitmap.height,
    x,
    y,
    width,
    height,
  );
}
export function scenePixelRatio(
  width: number,
  height: number,
  dpr: number,
  touch: boolean,
) {
  // Bound memory on iPad / large retina displays without reallocating the
  // backing buffer as Safari expands and collapses its browser controls.
  return Math.min(
    dpr || 1,
    2,
    Math.sqrt((touch ? 3_000_000 : 8_000_000) / Math.max(1, width * height)),
  );
}
export type SceneFrame = {
  width: number;
  height: number;
  room: Rect;
  stage: Rect;
  facade: Rect;
  doors: Rect[];
  plants: Rect[];
  entranceVisible: boolean;
};

export function createScenePainter(home: HTMLElement, repaint: () => void) {
  const touch = matchMedia("(pointer:coarse)").matches;
  const gpu =
    touch || home.dataset.stableViewport === "true"
      ? createGPUScenePainter(home, repaint, (width, height) =>
          scenePixelRatio(width, height, devicePixelRatio, true),
        )
      : null;
  if (gpu) {
    home.dataset.sceneSurface = "webgl";
    return gpu;
  }
  home.dataset.sceneSurface = "2d";
  const canvas = home.querySelector<HTMLCanvasElement>(
    ".courtyard-scene-canvas",
  )!;
  const context = canvas.getContext("2d", { alpha: false });
  const room = home.querySelector<HTMLImageElement>(
    ".courtyard-room-image img",
  )!;
  const facade = home.querySelector<HTMLImageElement>(".facade-image")!;
  const doors = Array.from(
    home.querySelectorAll<HTMLImageElement>(".facade-doors img"),
  );
  const plants = Array.from(
    home.querySelectorAll<HTMLImageElement>(".entrance-foliage img"),
  );
  const images = [room, facade, ...doors, ...plants];
  const sources = new Map<
    HTMLImageElement,
    { src: string; bitmap: ImageBitmap }
  >();
  const pending = new Map<HTMLImageElement, string>();
  let disposed = false,
    lost = false;
  function prepare() {
    for (const image of images) {
      const src = image.currentSrc;
      if (
        !image.complete ||
        !image.naturalWidth ||
        !src ||
        sources.get(image)?.src === src ||
        pending.get(image) === src
      )
        continue;
      pending.set(image, src);
      createImageBitmap(image)
        .then((bitmap) => {
          if (pending.get(image) === src) pending.delete(image);
          if (disposed || image.currentSrc !== src) {
            bitmap.close();
            return;
          }
          sources.get(image)?.bitmap.close();
          sources.set(image, { src, bitmap });
          repaint();
        })
        .catch(() => {
          if (pending.get(image) === src) pending.delete(image);
        });
    }
  }
  const isReady = () =>
    !!context &&
    !lost &&
    images.every((image) => sources.get(image)?.src === image.currentSrc);
  const onLost = () => {
    lost = true;
    delete home.dataset.scenePainted;
    repaint();
  };
  const onRestored = () => {
    lost = false;
    repaint();
  };
  canvas.addEventListener("contextlost", onLost);
  canvas.addEventListener("contextrestored", onRestored);
  function paint(frame: SceneFrame) {
    prepare();
    if (!context || !isReady()) {
      delete home.dataset.scenePainted;
      return;
    }
    // Use the stable CSS scene extent, never the changing innerHeight. The
    // canvas CSS box and its pixel buffer now have the exact same aspect ratio.
    const { width, height } = frame;
    const dpr = scenePixelRatio(width, height, devicePixelRatio, touch);
    const pixelWidth = Math.round(width * dpr),
      pixelHeight = Math.round(height * dpr);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    context.setTransform(pixelWidth / width, 0, 0, pixelHeight / height, 0, 0);
    context.fillStyle = "#c8ae80";
    context.fillRect(0, 0, width, height);
    const draw = (image: HTMLImageElement, rect: Rect, cover = false) =>
      drawVisibleImage(
        context,
        sources.get(image)!.bitmap,
        rect,
        width,
        height,
        cover,
      );
    draw(room, frame.room, true);
    if (frame.entranceVisible) {
      context.save();
      context.beginPath();
      context.rect(
        frame.stage.x,
        frame.stage.y,
        frame.stage.width,
        frame.stage.height,
      );
      context.clip();
      const atStage = (rect: Rect) => ({ ...rect, y: rect.y + frame.stage.y });
      draw(facade, atStage(frame.facade));
      doors.forEach((image, i) => draw(image, atStage(frame.doors[i])));
      plants.forEach((image, i) => draw(image, atStage(frame.plants[i])));
      context.restore();
    }
    home.dataset.scenePainted = "true";
  }
  images.forEach((image) => image.addEventListener("load", repaint));
  return {
    isReady,
    paint,
    dispose() {
      disposed = true;
      sources.forEach((source) => source.bitmap.close());
      images.forEach((image) => image.removeEventListener("load", repaint));
      canvas.removeEventListener("contextlost", onLost);
      canvas.removeEventListener("contextrestored", onRestored);
      delete home.dataset.scenePainted;
    },
  };
}
