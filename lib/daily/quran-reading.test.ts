import { describe, it, expect } from "vitest";
import { toggleBookmark, quranSurah, quranUrls } from "./quran-reading";
describe("Quran reading navigation", () => {
  it("removes the same bookmark, replaces a different verse, and preserves the input", () => {
    const saved = { surah: 2, ayah: 255 };
    expect(toggleBookmark(saved, { surah: 2, ayah: 255 })).toBeNull();
    expect(toggleBookmark(saved, { surah: 112, ayah: 1 })).toEqual({
      surah: 112,
      ayah: 1,
    });
    expect(saved).toEqual({ surah: 2, ayah: 255 });
    expect(toggleBookmark(null, saved)).toEqual(saved);
  });
  it.each(["0", "115", "-1", "1.5", "invalid", undefined])(
    "falls back safely for invalid surah %s",
    (value) => {
      expect(quranSurah(value)).toBe(1);
    },
  );
  it("keeps Arabic and translation requests on the same chapter", () => {
    for (let surah = 1; surah <= 114; surah++) {
      expect(quranSurah(String(surah))).toBe(surah);
      expect(quranUrls(surah, "english_saheeh")).toEqual([
        `/quran/v1.1-b6/${surah}.json`,
        `/quran/v1.1-b6/english_saheeh/${surah}.json`,
      ]);
    }
  });
});
