import { afterEach, expect, it, vi } from "vitest";
import { lockSceneViewport, sceneViewportChanged } from "./scene-viewport";

afterEach(() => vi.unstubAllGlobals());

it("reserves enough art for collapsed chrome even when the initial frame is inset", () => {
  vi.stubGlobal("window", { screen: { width: 440, height: 956 } });
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  vi.stubGlobal("getComputedStyle", () => ({ top: "96px", fontSize: "32px" }));
  const values = new Map<string, string>();
  const home = {
    style: {
      removeProperty: (key: string) => values.delete(key),
      setProperty: (key: string, value: string) => values.set(key, value),
    },
  } as unknown as HTMLElement;
  const stage = { clientHeight: 780 } as HTMLElement;
  const copy = { querySelector: () => ({}) } as unknown as HTMLElement;
  lockSceneViewport(home, stage, copy);
  expect(values.get("--scene-height")).toBe("956px");
  expect(values.get("--scene-copy-top")).toBe("96px");
  expect(values.get("--scene-title-size")).toBe("32px");
  // Toolbar height changes keep the same width, while rotation invalidates it.
  expect(sceneViewportChanged(440, 440)).toBe(false);
  expect(sceneViewportChanged(440, 956)).toBe(true);
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  lockSceneViewport(home, { clientHeight: 440 } as HTMLElement, copy);
  expect(values.get("--scene-height")).toBe("440px");
});
