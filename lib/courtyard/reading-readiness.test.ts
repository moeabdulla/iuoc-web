import { afterEach, expect, it, vi } from "vitest";
import {
  backgroundImageSource,
  watchReadingReadiness,
} from "./reading-readiness";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
const layers =
  'image-set(url("/reading-1920.webp") 1dppx, url("/reading-2800.webp") 2dppx), url("data:image/webp;base64,preview")';
it("waits on the real density-selected background, never the tiny preview", () => {
  expect(backgroundImageSource(layers, 1)).toBe("/reading-1920.webp");
  expect(backgroundImageSource(layers, 2)).toBe("/reading-2800.webp");
  expect(backgroundImageSource(layers, 3)).toBe("/reading-2800.webp");
});
it("handles Safari density syntax and the wide-screen single image override", () => {
  expect(
    backgroundImageSource(
      "image-set(url('/small.webp') 1x, url('/large.webp') 2x)",
      2,
    ),
  ).toBe("/large.webp");
  expect(backgroundImageSource('url("/wide.webp")', 2)).toBe("/wide.webp");
  expect(backgroundImageSource("none", 1)).toBeUndefined();
});
function setup() {
  vi.useFakeTimers();
  let decoded!: () => void;
  let reject!: () => void;
  const decode = new Promise<void>((resolve, fail) => {
    decoded = resolve;
    reject = () => fail(new Error("failed"));
  });
  const root = {
    dataset: {} as Record<string, string>,
    querySelector: () => ({}),
  };
  const image = { src: "", decode: () => decode };
  vi.stubGlobal(
    "Image",
    class {
      constructor() {
        return image;
      }
    },
  );
  vi.stubGlobal("getComputedStyle", () => ({ backgroundImage: layers }));
  vi.stubGlobal("devicePixelRatio", 2);
  vi.stubGlobal("window", { setTimeout, clearTimeout });
  vi.stubGlobal("document", { fonts: { ready: Promise.resolve() } });
  const stop = watchReadingReadiness(root as unknown as HTMLElement);
  return { root, image, decoded, reject, stop };
}
it("reveals the page only once its selected architectural image is decoded", async () => {
  const s = setup();
  expect(s.image.src).toBe("/reading-2800.webp");
  expect(s.root.dataset.sceneLoading).toBe("pending");
  s.decoded();
  await Promise.resolve();
  await Promise.resolve();
  expect(s.root.dataset.sceneLoading).toBe("ready");
  s.stop();
});
it("offers a continue option after a failed background request", async () => {
  const s = setup();
  s.reject();
  await Promise.resolve();
  await Promise.resolve();
  vi.advanceTimersByTime(10_000);
  expect(s.root.dataset.sceneLoading).toBe("slow");
  s.stop();
});
it("does not let a late load modify a page after navigation", async () => {
  const s = setup();
  s.stop();
  s.decoded();
  await Promise.resolve();
  await Promise.resolve();
  vi.advanceTimersByTime(10_000);
  expect(s.root.dataset.sceneLoading).toBe("pending");
});
