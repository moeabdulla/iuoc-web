import { afterEach, describe, expect, it, vi } from "vitest";
import { drawVisibleImage } from "./scene-painter";

afterEach(() => vi.unstubAllGlobals());
function draw(
  box: { x: number; y: number; width: number; height: number },
  fit = "fill",
) {
  vi.stubGlobal("getComputedStyle", () => ({ objectFit: fit }));
  const image = {
    getBoundingClientRect: () => ({
      ...box,
      left: box.x,
      top: box.y,
      right: box.x + box.width,
      bottom: box.y + box.height,
    }),
  } as HTMLImageElement;
  const bitmap = { width: 2000, height: 1000 } as ImageBitmap;
  const drawImage = vi.fn();
  drawVisibleImage(
    { drawImage } as unknown as CanvasRenderingContext2D,
    image,
    bitmap,
    1000,
    600,
  );
  return { drawImage, bitmap };
}
describe("viewport scene painting", () => {
  it("crops a huge projected facade to source pixels covering only the viewport", () => {
    const { drawImage, bitmap } = draw({
      x: -4000,
      y: -2000,
      width: 10000,
      height: 5000,
    });
    expect(drawImage).toHaveBeenCalledWith(
      bitmap,
      800,
      400,
      200,
      120,
      0,
      0,
      1000,
      600,
    );
  });
  it("preserves centered cover framing for the interior photograph", () => {
    const { drawImage, bitmap } = draw(
      { x: 0, y: 0, width: 1000, height: 600 },
      "cover",
    );
    const args = drawImage.mock.calls[0];
    expect(args[0]).toBe(bitmap);
    expect(args[1]).toBeCloseTo(166.6666667);
    expect(args[2]).toBe(0);
    expect(args[3]).toBeCloseTo(1666.6666667);
    expect(args.slice(4)).toEqual([1000, 0, 0, 1000, 600]);
  });
  it("does not draw an offscreen parked layer", () => {
    expect(
      draw({ x: -2100, y: 0, width: 2000, height: 1000 }).drawImage,
    ).not.toHaveBeenCalled();
  });
});
