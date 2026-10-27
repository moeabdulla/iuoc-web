import { describe, expect, it, vi } from "vitest";
import { drawVisibleImage, scenePixelRatio } from "./scene-painter";

function draw(
  box: { x: number; y: number; width: number; height: number },
  fit = "fill",
) {
  const bitmap = { width: 2000, height: 1000 } as ImageBitmap;
  const drawImage = vi.fn();
  drawVisibleImage(
    { drawImage } as unknown as CanvasRenderingContext2D,
    bitmap,
    box,
    1000,
    600,
    fit === "cover",
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

describe("canvas allocation budget", () => {
  it("keeps normal phone rendering sharp without exceeding the touch budget", () => {
    expect(scenePixelRatio(390, 844, 3, true)).toBe(2);
    const ratio = scenePixelRatio(1024, 1366, 3, true);
    expect(1024 * 1366 * ratio * ratio).toBeLessThanOrEqual(3_000_001);
  });
  it("bounds retina desktop canvas memory", () => {
    const ratio = scenePixelRatio(3840, 2160, 2, false);
    expect(3840 * 2160 * ratio * ratio).toBeLessThanOrEqual(8_000_001);
  });
});

it("keeps the buffer stable through changing browser-toolbar heights without measuring source elements", async () => {
  const { createScenePainter } = await import("./scene-painter");
  let width = 300,
    height = 150,
    allocations = 0;
  const context = {
    setTransform: vi.fn(),
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    beginPath: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    restore: vi.fn(),
  };
  const canvas = {
    get width() {
      return width;
    },
    set width(n: number) {
      width = n;
      allocations++;
    },
    get height() {
      return height;
    },
    set height(n: number) {
      height = n;
      allocations++;
    },
    getContext: () => context,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  function source(src: string) {
    return {
      currentSrc: src,
      complete: true,
      naturalWidth: 2000,
      getBoundingClientRect: vi.fn(() => {
        throw new Error("Unexpected layout read");
      }),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
  }
  const room = source("room.webp"),
    facade = source("facade.webp");
  const home = {
    dataset: {} as Record<string, string>,
    querySelector: (s: string) =>
      s === ".courtyard-scene-canvas"
        ? canvas
        : s === ".facade-image"
          ? facade
          : room,
    querySelectorAll: () => [],
  };
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  vi.stubGlobal("devicePixelRatio", 2);
  vi.stubGlobal("innerHeight", 650);
  vi.stubGlobal("createImageBitmap", async () => ({
    width: 2000,
    height: 1000,
    close: vi.fn(),
  }));
  try {
    const painter = createScenePainter(home as unknown as HTMLElement, vi.fn());
    const box = { x: 0, y: 0, width: 390, height: 844 };
    const frame = {
      width: 390,
      height: 844,
      room: box,
      stage: box,
      facade: box,
      doors: [],
      plants: [],
      entranceVisible: true,
    };
    painter.paint(frame);
    await Promise.resolve();
    painter.paint(frame);
    expect([width, height]).toEqual([780, 1688]);
    expect(allocations).toBe(2);
    vi.stubGlobal("innerHeight", 740);
    painter.paint(frame);
    expect(allocations).toBe(2);
    expect(room.getBoundingClientRect).not.toHaveBeenCalled();
    expect(facade.getBoundingClientRect).not.toHaveBeenCalled();
    expect(home.dataset.scenePainted).toBe("true");
    painter.dispose();
  } finally {
    vi.unstubAllGlobals();
  }
});
