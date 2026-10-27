import { localDayNumber } from "./quiz-select";
export type ShareVerse = {
  surah: number;
  ayah: number;
  name: string;
  arabic: string;
  translation: string;
};
/** Same reduced-Julian-day and stride as the app's daily-verse-pick.ts. */
export function dailyVerseIndex(date: Date, length: number) {
  if (!length) throw new Error("The curated verse list is empty");
  return ((((localDayNumber(date) + 40588) * 37) % length) + length) % length;
}
export function verseLink(
  origin: string,
  verse: Pick<ShareVerse, "surah" | "ayah">,
  translation = "english_saheeh",
) {
  const url = new URL("/quran", origin);
  url.searchParams.set("surah", String(verse.surah));
  url.searchParams.set("translation", translation);
  url.hash = `ayah-${verse.ayah}`;
  return url.href;
}
/** Match the app's image-only presentation cleanup; stored scripture is unchanged. */
export function shareTranslation(text: string, ayah: number) {
  const prefix = /^\((\d+)\)\s*/.exec(text);
  return (
    prefix && Number(prefix[1]) === ayah ? text.slice(prefix[0].length) : text
  )
    .replace(/\[\d+\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
