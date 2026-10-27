import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { questionFor, dayKey, type QuizQuestion } from "./quiz-select";
import bankFile from "../../data/quiz/questions.json";
import { dateInZone, calendarDate } from "./prayer/calendar";
import { timesFor } from "./prayer/times";
import { NO_OFFSETS, type PrayerConfig } from "./prayer/params";
import catalog from "../../public/quran/v1.1-b6/catalog.json";
const bank = bankFile.questions as QuizQuestion[];
describe("app daily-question selection", () => {
  it("shares a question for the entire local day and preserves the correct option", () => {
    for (let i = 0; i < bank.length; i++) {
      const morning = new Date(2026, 9, 26 + i, 0, 1),
        evening = new Date(2026, 9, 26 + i, 23, 59);
      const q = questionFor(bank, morning)!;
      expect(questionFor(bank, evening)).toEqual(q);
      const original = bank.find((x) => x.id === q.id)!;
      expect(q.options[q.answer]).toBe(original.options[original.answer]);
    }
  });
  it("covers the bank once per cycle, including daylight saving transitions", () => {
    const questions = Array.from(
      { length: bank.length },
      (_, i) => questionFor(bank, new Date(2026, 9, 26 + i))!.id,
    );
    expect(new Set(questions).size).toBe(bank.length);
    expect(dayKey(new Date(2026, 10, 1))).toBe("2026-11-01");
    expect(questionFor([], new Date())).toBeNull();
  });
});
describe("prayer dates and school settings", () => {
  it("uses the selected location’s date across midnight and DST", () => {
    expect(
      dateInZone(new Date("2026-11-01T02:30:00Z"), "America/Toronto"),
    ).toBe("2026-10-31");
    expect(
      dateInZone(new Date("2026-11-01T06:30:00Z"), "America/Toronto"),
    ).toBe("2026-11-01");
    expect(dateInZone(new Date("2026-11-01T02:30:00Z"), "Asia/Riyadh")).toBe(
      "2026-11-01",
    );
    expect(dayKey(calendarDate("2026-03-08", 1))).toBe("2026-03-09");
  });
  it("changes Asr independently and retains Ja’fari Maghrib", () => {
    const coords = { latitude: 45.4215, longitude: -75.6972 },
      day = calendarDate("2026-10-26");
    const config: PrayerConfig = {
      school: "sunni",
      method: "NorthAmerica",
      asr: "standard",
      offsets: NO_OFFSETS,
    };
    const standard = timesFor(coords, day, config),
      hanafi = timesFor(coords, day, { ...config, asr: "hanafi" });
    expect(hanafi[3].at.getTime()).toBeGreaterThan(standard[3].at.getTime());
    expect(hanafi[0].at).toEqual(standard[0].at);
    const shia = timesFor(coords, day, {
      ...config,
      school: "shia",
      method: "LevaQom",
    });
    expect(shia[4].at.getTime()).toBeGreaterThan(standard[4].at.getTime());
    const adjusted = timesFor(coords, day, {
      ...config,
      offsets: { ...NO_OFFSETS, fajr: 5 },
    });
    expect(adjusted[0].at.getTime() - standard[0].at.getTime()).toBe(300000);
  });
});
describe("versioned Quran export", () => {
  it("contains all verses and complete translations with source attribution", () => {
    let count = 0,
      splits = 0;
    for (const surah of catalog.suras) {
      const chapter = JSON.parse(
        readFileSync(`public/quran/v1.1-b6/${surah.id}.json`, "utf8"),
      );
      expect(chapter.verses.length).toBe(surah.ayas);
      expect(chapter.notice).toContain("CHANGING IT IS NOT ALLOWED");
      count += chapter.verses.length;
      splits += chapter.verses.filter(
        (v: { basmala: number }) => v.basmala > 0,
      ).length;
      if (surah.id === 1 || surah.id === 9)
        expect(chapter.verses[0].basmala).toBe(0);
      for (const translation of catalog.translations) {
        const text = JSON.parse(
          readFileSync(
            `public/quran/v1.1-b6/${translation.key}/${surah.id}.json`,
            "utf8",
          ),
        );
        expect(text.verses.length).toBe(surah.ayas);
        expect(text.source.attribution).toBe(translation.attribution);
      }
    }
    expect(count).toBe(6236);
    expect(splits).toBe(112);
  });
});
