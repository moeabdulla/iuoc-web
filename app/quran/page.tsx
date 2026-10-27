import { readFile } from "node:fs/promises";
import path from "node:path";
import { quranSurah } from "@/lib/daily/quran-reading";
import { Suspense } from "react";
import { ToolShell } from "@/components/daily/tool-shell";
import { QuranReader } from "@/components/daily/quran";
import catalog from "@/public/quran/v1.1-b6/catalog.json";
export const metadata = {
  title: "Read the Quran",
  description:
    "Read the Quran with English translations, a verse bookmark, and adjustable Arabic text.",
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ surah?: string; translation?: string }>;
}) {
  const params = await searchParams;
  const surah = quranSurah(params.surah ?? 1);
  const translationKey =
    catalog.translations.find((t) => t.key === params.translation)?.key ??
    "english_saheeh";
  const root = path.join(process.cwd(), "public/quran/v1.1-b6");
  const [chapter, translated] = await Promise.all([
    readFile(path.join(root, `${surah}.json`), "utf8").then(JSON.parse),
    readFile(path.join(root, translationKey, `${surah}.json`), "utf8").then(
      JSON.parse,
    ),
  ]);
  return (
    <ToolShell title="The Quran" icon="quran">
      <Suspense fallback={<p>Loading the Quran reader…</p>}>
        <QuranReader
          catalog={catalog}
          initial={{ surah, chapter, translated, translationKey }}
        />
      </Suspense>
    </ToolShell>
  );
}
