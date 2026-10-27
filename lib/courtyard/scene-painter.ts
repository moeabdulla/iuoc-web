import type { Rect } from "./entrance-scene";

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
  if (!bitmap.width || !box.width || !box.height) return;
  let { x, y, width, height } = box;
  if (cover) {
    const scale = Math.max(width / bitmap.width, height / bitmap.height);
    width = bitmap.width * scale;
    height = bitmap.height * scale;
    x += (box.width - width) / 2;
    y += (box.height - height) / 2;
  }
  const left = Math.max(0, box.x, x);
  const top = Math.max(0, box.y, y);
  const right = Math.min(viewportWidth, box.x + box.width, x + width);
  const bottom = Math.min(viewportHeight, box.y + box.height, y + height);
  if (right <= left || bottom <= top) return;
  const sx = bitmap.width / width,
    sy = bitmap.height / height;
  context.drawImage(
    bitmap,
    (left - x) * sx,
    (top - y) * sy,
    (right - left) * sx,
    (bottom - top) * sy,
    left,
    top,
    right - left,
    bottom - top,
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
  const touch = matchMedia("(pointer:coarse)").matches;
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
