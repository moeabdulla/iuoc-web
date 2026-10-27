import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { toRuns, spansAfter, spansBefore, type TajweedSpan } from "./tajweed";
import { resolveTajweedColors } from "./tajweed-groups";
import type { Chapter } from "./quran-reading";
describe("app-derived Tajweed annotations", () => {
  it("preserves every Quran character and every Basmala split across all chapters", () => {
    let verses = 0,
      annotations = 0;
    for (let surah = 1; surah <= 114; surah++) {
      const chapter = JSON.parse(
        readFileSync(`public/quran/v1.1-b6/${surah}.json`, "utf8"),
      ) as Chapter;
      for (const v of chapter.verses) {
        const spans = v.tajweed ?? [];
        verses++;
        annotations += spans.length;
        expect(
          toRuns(v.text, spans)
            .map((r) => r.text)
            .join(""),
        ).toBe(v.text);
        for (const s of spans) {
          expect(s.start).toBeGreaterThanOrEqual(0);
          expect(s.end).toBeLessThanOrEqual([...v.text].length);
          expect(s.start < v.basmala && s.end > v.basmala).toBe(false);
        }
        const header = [...v.text].slice(0, v.basmala).join("");
        const body = [...v.text].slice(v.basmala).join("");
        expect(
          toRuns(header, spansBefore(spans, v.basmala))
            .map((r) => r.text)
            .join("") +
            toRuns(body, spansAfter(spans, v.basmala))
              .map((r) => r.text)
              .join(""),
        ).toBe(v.text);
      }
    }
    expect(verses).toBe(6236);
    expect(annotations).toBeGreaterThan(10000);
  });
  it("uses code points and resolves overlapping rules consistently", () => {
    const spans: TajweedSpan[] = [
      { start: 1, end: 4, rule: "ghunnah" },
      { start: 2, end: 3, rule: "ikhfa" },
    ];
    expect(toRuns("😀abc", spans)).toEqual([
      { text: "😀", rule: null },
      { text: "a", rule: "ghunnah" },
      { text: "b", rule: "ikhfa" },
      { text: "c", rule: "ghunnah" },
    ]);
    expect(toRuns("😀abc", [...spans].reverse())).toEqual(
      toRuns("😀abc", spans),
    );
  });
  it("supports the app palette, no colour and per-group overrides", () => {
    expect(resolveTajweedColors({}).madd_2).toBeNull();
    expect(resolveTajweedColors({ ikhfa: "blue" }).ikhfa).toEqual({
      light: "#1976D2",
      dark: "#90CAF9",
    });
    expect(resolveTajweedColors({ ikhfa: "blue" }).ikhfa_shafawi).toEqual({
      light: "#1976D2",
      dark: "#90CAF9",
    });
    expect(resolveTajweedColors({ qalqalah: "none" }).qalqalah).toBeNull();
  });
});
