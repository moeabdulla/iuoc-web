import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { watchSceneReadiness } from "./scene-readiness";

let mutation: () => void;
let fontsLoaded: () => void;
let disconnect: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.useFakeTimers();
  disconnect = vi.fn();
  vi.stubGlobal(
    "MutationObserver",
    class {
      constructor(callback: () => void) {
        mutation = callback;
      }
      observe() {}
      disconnect = disconnect;
    },
  );
  vi.stubGlobal("window", { setTimeout, clearTimeout });
  vi.stubGlobal("document", {
    fonts: {
      status: "loading",
      ready: new Promise<void>((resolve) => {
        fontsLoaded = resolve;
      }),
    },
  });
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
function scene(simple = false, images: HTMLImageElement[] = []) {
  return {
    dataset: { simpleEntrance: String(simple), sceneLoading: "pending" },
    querySelectorAll: () => images,
  } as unknown as HTMLElement;
}
it("keeps the preview hidden until both decoded paint and fonts are ready", async () => {
  const home = scene();
  const stop = watchSceneReadiness(home);
  home.dataset.scenePainted = "true";
  mutation();
  expect(home.dataset.sceneLoading).toBe("pending");
  fontsLoaded();
  await Promise.resolve();
  expect(home.dataset.sceneLoading).toBe("ready");
  stop();
});
it("does not reveal an unpositioned DOM room just because the fonts loaded", async () => {
  const home = scene();
  const stop = watchSceneReadiness(home);
  fontsLoaded();
  await Promise.resolve();
  expect(home.dataset.sceneLoading).toBe("pending");
  home.dataset.scenePainted = "true";
  mutation();
  expect(home.dataset.sceneLoading).toBe("ready");
  stop();
});
it("waits for native mobile images to decode without requiring a canvas", async () => {
  let decodeImage!: () => void;
  const image = {
    complete: true,
    naturalWidth: 1600,
    currentSrc: "facade.webp",
    decode: vi.fn(
      () =>
        new Promise<void>((resolve) => {
          decodeImage = resolve;
        }),
    ),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as HTMLImageElement;
  const home = scene(true, [image]);
  const stop = watchSceneReadiness(home);
  fontsLoaded();
  await Promise.resolve();
  expect(home.dataset.sceneLoading).toBe("pending");
  decodeImage();
  await Promise.resolve();
  expect(home.dataset.sceneLoading).toBe("ready");
  expect(image.decode).toHaveBeenCalledOnce();
  expect(home.dataset.scenePainted).toBeUndefined();
  stop();
  expect(image.removeEventListener).toHaveBeenCalledWith(
    "load",
    expect.any(Function),
  );
});
it("does not expose a failed mobile image as a sharp scene", async () => {
  const image = {
    complete: true,
    naturalWidth: 1600,
    currentSrc: "facade.webp",
    decode: () => Promise.reject(new Error("decode failed")),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as HTMLImageElement;
  const home = scene(true, [image]);
  const stop = watchSceneReadiness(home);
  fontsLoaded();
  await Promise.resolve();
  await Promise.resolve();
  vi.advanceTimersByTime(10_000);
  expect(home.dataset.sceneLoading).toBe("slow");
  stop();
});
it("offers an escape on a slow or failed download, and still completes later", async () => {
  const home = scene();
  const stop = watchSceneReadiness(home);
  vi.advanceTimersByTime(10_000);
  expect(home.dataset.sceneLoading).toBe("slow");
  home.dataset.scenePainted = "true";
  fontsLoaded();
  await Promise.resolve();
  expect(home.dataset.sceneLoading).toBe("ready");
  stop();
});
it("does not mutate a departed page when pending fonts finish", async () => {
  const home = scene();
  const stop = watchSceneReadiness(home);
  stop();
  home.dataset.scenePainted = "true";
  fontsLoaded();
  await Promise.resolve();
  vi.advanceTimersByTime(10_000);
  expect(home.dataset.sceneLoading).toBe("pending");
  expect(disconnect).toHaveBeenCalledOnce();
});
