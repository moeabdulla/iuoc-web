import type { TajweedSpan } from "./tajweed";
export type Verse = {
  aya: number;
  text: string;
  basmala: number;
  tajweed?: TajweedSpan[];
};
export type Chapter = { sura: number; verses: Verse[] };
export type Translation = {
  verses: { aya: number; text: string; footnotes: string | null }[];
};
export type Mark = { surah: number; ayah: number };
export function toggleBookmark(current: Mark | null, next: Mark): Mark | null {
  return current?.surah === next.surah && current?.ayah === next.ayah
    ? null
    : next;
}
export function quranSurah(value: unknown) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 114 ? n : 1;
}
export function quranUrls(surah: number, translation: string) {
  const base = "/quran/v1.1-b6";
  return [`${base}/${surah}.json`, `${base}/${translation}/${surah}.json`];
}
export type InitialReading = {
  surah: number;
  chapter: Chapter;
  translated: Translation;
  translationKey?: string;
};
