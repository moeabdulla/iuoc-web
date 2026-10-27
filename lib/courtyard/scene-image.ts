import type { Rect } from "./entrance-scene";

/** Source and destination crop shared by the 2D and GPU renderers. */
export function visibleImageCrop(
  sourceWidth: number,
  sourceHeight: number,
  box: Rect,
  viewportWidth: number,
  viewportHeight: number,
  cover = false,
) {
  if (!sourceWidth || !sourceHeight || !box.width || !box.height) return null;
  let { x, y, width, height } = box;
  if (cover) {
    const scale = Math.max(width / sourceWidth, height / sourceHeight);
    width = sourceWidth * scale;
    height = sourceHeight * scale;
    x += (box.width - width) / 2;
    y += (box.height - height) / 2;
  }
  const left = Math.max(0, box.x, x);
  const top = Math.max(0, box.y, y);
  const right = Math.min(viewportWidth, box.x + box.width, x + width);
  const bottom = Math.min(viewportHeight, box.y + box.height, y + height);
  if (right <= left || bottom <= top) return null;
  return {
    source: [
      (left - x) / width,
      (top - y) / height,
      (right - left) / width,
      (bottom - top) / height,
    ],
    destination: [left, top, right - left, bottom - top],
  };
}
