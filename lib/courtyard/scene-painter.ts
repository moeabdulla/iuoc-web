/** Paint only the visible portion of a photograph. The canvas and its draws stay
 * viewport-sized even when the projected facade is many screens wide. */
export function drawVisibleImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  bitmap: ImageBitmap,
  viewportWidth: number,
  viewportHeight: number,
) {
  if (!bitmap.width) return;
  const box = image.getBoundingClientRect();
  if (!box.width || !box.height) return;
  let x = box.x,
    y = box.y,
    width = box.width,
    height = box.height;
  if (getComputedStyle(image).objectFit === "cover") {
    const scale = Math.max(width / bitmap.width, height / bitmap.height);
    width = bitmap.width * scale;
    height = bitmap.height * scale;
    x += (box.width - width) / 2;
    y += (box.height - height) / 2;
  }
  const left = Math.max(0, box.left, x);
  const top = Math.max(0, box.top, y);
  const right = Math.min(viewportWidth, box.right, x + width);
  const bottom = Math.min(viewportHeight, box.bottom, y + height);
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

/** A fresh complete frame also works when the route mounts at a restored scroll
 * position. Source <img>s retain responsive selection and geometry, but are no
 * longer promoted into independently scaled compositor surfaces. */
export function createScenePainter(home: HTMLElement, repaint: () => void) {
  const canvas = home.querySelector<HTMLCanvasElement>(
    ".courtyard-scene-canvas",
  )!;
  const context = canvas.getContext("2d", { alpha: false });
  const images = Array.from(
    home.querySelectorAll<HTMLImageElement>(
      ".courtyard-room-image img, .facade-plane img, .entrance-foliage img",
    ),
  );
  const sources = new Map<
    HTMLImageElement,
    { src: string; bitmap: ImageBitmap }
  >();
  const pending = new Map<HTMLImageElement, string>();
  let disposed = false;
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
      // A responsive img's naturalWidth is density-corrected. ImageBitmap gives
      // source-pixel dimensions for unambiguous drawImage crop coordinates.
      createImageBitmap(image)
        .then((bitmap) => {
          if (disposed || image.currentSrc !== src) {
            bitmap.close();
            return;
          }
          sources.get(image)?.bitmap.close();
          sources.set(image, { src, bitmap });
          pending.delete(image);
          repaint();
        })
        .catch(() => {
          pending.delete(image);
        });
    }
  }
  const stage = home.querySelector<HTMLElement>(".entrance-stage")!;
  const roomImage = home.querySelector<HTMLImageElement>(
    ".courtyard-room-image img",
  )!;
  const paint = (entranceVisible: boolean) => {
    prepare();
    if (
      !context ||
      images.some((image) => sources.get(image)?.src !== image.currentSrc)
    ) {
      delete home.dataset.scenePainted;
      return;
    }
    const width = innerWidth,
      height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const pixelWidth = Math.round(width * dpr),
      pixelHeight = Math.round(height * dpr);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.fillStyle = "#c8ae80";
    context.fillRect(0, 0, width, height);
    drawVisibleImage(
      context,
      roomImage,
      sources.get(roomImage)!.bitmap,
      width,
      height,
    );
    if (entranceVisible) {
      // Canvas draws do not inherit the source elements' ancestor overflow clip.
      // In particular, the parked facade's steps can re-enter the viewport as
      // the sticky stage leaves it. Reapply that stage boundary explicitly.
      const bounds = stage.getBoundingClientRect();
      context.save();
      context.beginPath();
      context.rect(bounds.x, bounds.y, bounds.width, bounds.height);
      context.clip();
      for (const image of images) {
        if (image !== roomImage)
          drawVisibleImage(
            context,
            image,
            sources.get(image)!.bitmap,
            width,
            height,
          );
      }
      context.restore();
    }
    home.dataset.scenePainted = "true";
  };
  images.forEach((image) => image.addEventListener("load", repaint));
  return {
    paint,
    dispose() {
      disposed = true;
      sources.forEach((source) => source.bitmap.close());
      images.forEach((image) => image.removeEventListener("load", repaint));
      delete home.dataset.scenePainted;
    },
  };
}
