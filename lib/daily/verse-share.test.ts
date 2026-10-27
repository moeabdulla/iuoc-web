import { describe, expect, it } from "vitest";
import quotes from "../../data/verses/daily.json";
import { readFileSync } from "node:fs";
import { dailyVerseIndex, shareTranslation, verseLink } from "./verse-share";

describe("daily verse parity and source integrity", () => {
  it("matches the app's reduced-Julian-day selection on the same local date", () => {
    expect(
      quotes.verses[
        dailyVerseIndex(new Date(2026, 9, 27, 12), quotes.verses.length)
      ],
    ).toMatchObject({ surah: 3, ayah: 200 });
    const cycle = Array.from({ length: 109 }, (_, i) =>
      dailyVerseIndex(new Date(2026, 9, 27 + i, 12), 109),
    );
    expect(new Set(cycle).size).toBe(109);
    expect(dailyVerseIndex(new Date(2026, 9, 27, 0, 1), 109)).toBe(
      dailyVerseIndex(new Date(2026, 9, 27, 23, 59), 109),
    );
  });
  it("uses the app’s default Rowwad translation", () => {
    expect(quotes.translationKey).toBe("english_rwwad");
  });
  it("keeps every curated Arabic verse and translation identical to the shipped corpus", () => {
    for (const verse of quotes.verses) {
      const chapter = JSON.parse(
        readFileSync(`public/quran/v1.1-b6/${verse.surah}.json`, "utf8"),
      );
      const arabic = chapter.verses.find(
        (v: { aya: number }) => v.aya === verse.ayah,
      );
      expect(verse.arabic).toBe(
        [...arabic.text].slice(arabic.basmala).join(""),
      );
      const translation = JSON.parse(
        readFileSync(
          `public/quran/v1.1-b6/${quotes.translationKey}/${verse.surah}.json`,
          "utf8",
        ),
      );
      expect(verse.translation).toBe(
        translation.verses.find((v: { aya: number }) => v.aya === verse.ayah)
          .text,
      );
    }
  });
});
describe("ayah sharing", () => {
  it("omits Rowwad from default and explicitly default share links", () => {
    const expected = "https://iuoc.ca/quran?surah=3#ayah-200";
    expect(verseLink("https://iuoc.ca", { surah: 3, ayah: 200 })).toBe(
      expected,
    );
    expect(
      verseLink("https://iuoc.ca", { surah: 3, ayah: 200 }, "english_rwwad"),
    ).toBe(expected);
  });
  it("produces a link that retains the surah, translation and exact ayah", () => {
    const url = new URL(
      verseLink("https://iuoc.ca", { surah: 2, ayah: 255 }, "en_pickthall"),
    );
    expect(url.pathname).toBe("/quran");
    expect(url.searchParams.get("surah")).toBe("2");
    expect(url.searchParams.get("translation")).toBe("en_pickthall");
    expect(url.hash).toBe("#ayah-255");
  });
  it("removes standalone-image footnote markers and only the matching ayah prefix", () => {
    expect(shareTranslation("(5) Only You [12] we ask.", 5)).toBe(
      "Only You we ask.",
    );
    expect(shareTranslation("(Moses) answered: ...", 7)).toBe(
      "(Moses) answered: ...",
    );
    expect(shareTranslation("(8) A reference", 7)).toBe("(8) A reference");
  });
});
