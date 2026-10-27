import { describe, expect, it, vi } from "vitest";
import { createGPUScenePainter } from "./gpu-scene-painter";
import type { SceneFrame } from "./scene-painter";

function setup(available = true) {
  const calls: Record<string, ReturnType<typeof vi.fn>> = {};
  const gl = new Proxy(
    {},
    {
      get(_, name: string) {
        if (name === name.toUpperCase()) return name;
        return (calls[name] ??= vi.fn(() => {
          if (name === "getProgramParameter") return true;
          if (name === "getExtension") return null;
          return {};
        }));
      },
    },
  ) as WebGLRenderingContext;
  const listeners: Record<string, EventListener> = {};
  let allocations = 0,
    width = 0,
    height = 0;
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
    getContext: () => (available ? gl : null),
    addEventListener: (name: string, fn: EventListener) => {
      listeners[name] = fn;
    },
    removeEventListener: vi.fn(),
  };
  const images = Array.from({ length: 6 }, (_, i) => ({
    currentSrc: `${i}.webp`,
    complete: true,
    naturalWidth: 1000,
    naturalHeight: 2000,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  const home = {
    dataset: {} as Record<string, string>,
    querySelector: (selector: string) =>
      selector === ".courtyard-scene-canvas"
        ? canvas
        : selector === ".facade-image"
          ? images[1]
          : images[0],
    querySelectorAll: (selector: string) =>
      selector === ".facade-doors img" ? images.slice(2, 4) : images.slice(4),
  };
  const box = { x: 0, y: 0, width: 440, height: 956 };
  const frame: SceneFrame = {
    width: 440,
    height: 956,
    stage: box,
    room: box,
    facade: box,
    doors: [box, box],
    plants: [box, box],
    entranceVisible: true,
  };
  const repaint = vi.fn();
  const painter = createGPUScenePainter(
    home as unknown as HTMLElement,
    repaint,
    () => 2,
  );
  return {
    calls,
    canvas,
    home,
    images,
    frame,
    painter,
    repaint,
    listeners,
    allocations: () => allocations,
  };
}

describe("mobile GPU scene lifecycle", () => {
  it("uploads each photograph once and only changes rectangle uniforms while scrolling", () => {
    const s = setup();
    s.painter!.paint(s.frame);
    expect(s.calls.texImage2D).toHaveBeenCalledTimes(6);
    expect(s.calls.drawArrays).toHaveBeenCalledTimes(6);
    expect([s.canvas.width, s.canvas.height]).toEqual([880, 1912]);
    for (let i = 0; i < 20; i++) {
      s.painter!.paint({
        ...s.frame,
        facade: { ...s.frame.facade, x: -i * 10 },
      });
    }
    expect(s.calls.texImage2D).toHaveBeenCalledTimes(6);
    expect(s.calls.bufferData).toHaveBeenCalledTimes(1);
    expect(s.allocations()).toBe(2);
    expect(s.home.dataset.scenePainted).toBe("true");
    s.painter!.dispose();
  });
  it("replaces only a changed responsive texture and omits the entrance after the doorway", () => {
    const s = setup();
    s.painter!.paint(s.frame);
    s.images[1].currentSrc = "larger-facade.webp";
    s.painter!.paint({ ...s.frame, entranceVisible: false });
    expect(s.calls.texImage2D).toHaveBeenCalledTimes(7);
    expect(s.calls.deleteTexture).toHaveBeenCalledTimes(1);
    expect(s.calls.drawArrays).toHaveBeenCalledTimes(7); // six entrance layers, then room only
    s.painter!.dispose();
  });
  it("rebuilds textures after context restoration and releases them when leaving the page", () => {
    const s = setup();
    s.painter!.paint(s.frame);
    const preventDefault = vi.fn();
    s.listeners.webglcontextlost({ preventDefault } as unknown as Event);
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(s.painter!.isReady()).toBe(false);
    expect(s.home.dataset.scenePainted).toBeUndefined();
    s.listeners.webglcontextrestored({} as Event);
    s.painter!.paint(s.frame);
    expect(s.calls.texImage2D).toHaveBeenCalledTimes(12);
    expect(s.painter!.isReady()).toBe(true);
    s.painter!.dispose();
    expect(s.calls.deleteTexture).toHaveBeenCalledTimes(6);
    expect(s.home.dataset.scenePainted).toBeUndefined();
    expect(
      s.images.every(
        (image) => image.removeEventListener.mock.calls.length === 1,
      ),
    ).toBe(true);
  });
  it("allows the existing renderer to handle devices without WebGL", () => {
    expect(setup(false).painter).toBeNull();
  });
});
