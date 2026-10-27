"use client";
import { useEffect, useRef, type CSSProperties, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Share2, Bookmark, ArrowLeft, ArrowRight } from "lucide-react";
import { useLocationHash } from "@/lib/daily/use-location-hash";
import { VerseShare } from "./verse-share";
import type { ShareVerse } from "@/lib/daily/verse-share";
import { TajweedText, TajweedSettings, type TajweedChoices } from "./tajweed";
import { spansBefore, spansAfter } from "@/lib/daily/tajweed";
import { useBrowserStorage } from "@/lib/daily/use-browser-storage";
import {
  toggleBookmark,
  quranSurah,
  quranUrls,
  type Chapter,
  type Translation,
  type Mark,
  type InitialReading,
} from "@/lib/daily/quran-reading";
import { resourceKey, useResource } from "@/lib/daily/use-resource";
import type catalogFile from "@/public/quran/v1.1-b6/catalog.json";
type Catalog = typeof catalogFile;
export function QuranReader({
  catalog,
  initial,
}: {
  catalog: Catalog;
  initial: InitialReading;
}) {
  const params = useSearchParams();
  const hash = useLocationHash();
  const [shareVerse, setShareVerse] = useState<ShareVerse | null>(null);
  const surah = quranSurah(params.get("surah") ?? initial.surah);
  const pendingAyah = useRef<number | null>(null);
  const [translation, setTranslation] = useBrowserStorage(
    "iuoc.quran.translation",
    "english_saheeh",
  );
  const [bookmark, setBookmark] = useBrowserStorage<Mark | null>(
    "iuoc.quran.bookmark",
    null,
  );
  const [size, setSize] = useState(34);
  const [tajweed, setTajweed] = useBrowserStorage("iuoc.quran.tajweed", false);
  const [tajweedChoices, setTajweedChoices] = useBrowserStorage<TajweedChoices>(
    "iuoc.quran.tajweed-colours",
    {},
  );
  const selected =
    catalog.translations.find(
      (t) => t.key === (params.get("translation") ?? translation),
    ) ?? catalog.translations[0];
  const reading = useResource<[Chapter, Translation]>(
    quranUrls(surah, selected.key),
    {
      key: resourceKey(
        quranUrls(initial.surah, initial.translationKey ?? "english_saheeh"),
      ),
      data: [initial.chapter, initial.translated],
    },
  );
  const [chapter, translated] = reading.data;
  const displayedSurah = chapter.sura;
  const info = catalog.suras[displayedSurah - 1];
  useEffect(() => {
    if (reading.pending) return;
    const ayah =
      pendingAyah.current ?? Number(location.hash.match(/^#ayah-(\d+)$/)?.[1]);
    if (ayah)
      document
        .getElementById(`ayah-${ayah}`)
        ?.scrollIntoView({ block: "start", behavior: "smooth" });
    pendingAyah.current = null;
  }, [reading.key, reading.pending]);
  function go(next: number, ayah?: number) {
    pendingAyah.current = ayah ?? null;
    // Native history integrates with Next's search params without an RSC route
    // remount or a stale bookmark hash forcing a second scroll/navigation.
    window.history.replaceState(
      null,
      "",
      `/quran?surah=${next}&translation=${selected.key}${ayah ? `#ayah-${ayah}` : ""}`,
    );
    if (next === displayedSurah && ayah)
      document
        .getElementById(`ayah-${ayah}`)
        ?.scrollIntoView({ block: "start", behavior: "smooth" });
  }
  const first = chapter.verses[0];
  return (
    <>
      <p className="daily-intro">
        Read the Quran with an English translation. Save an ayah or share it as
        an image or a link.
      </p>
      {bookmark &&
        Number.isInteger(bookmark.surah) &&
        bookmark.surah >= 1 &&
        bookmark.surah <= 114 && (
          <button
            className="daily-link"
            onClick={() => go(bookmark.surah, bookmark.ayah)}
          >
            <Bookmark size={17} /> Continue at{" "}
            {catalog.suras[bookmark.surah - 1].name_translit} {bookmark.surah}:
            {bookmark.ayah}
          </button>
        )}
      <div className="daily-controls quran-controls">
        <label>
          Surah
          <select
            aria-label="Surah"
            value={surah}
            onChange={(e) => go(Number(e.target.value))}
          >
            {catalog.suras.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id}. {s.name_translit} — {s.name_en}
              </option>
            ))}
          </select>
        </label>
        <label>
          Translation
          <select
            aria-label="Translation"
            value={selected.key}
            onChange={(e) => {
              setTranslation(e.target.value);
              const url = new URL(location.href);
              url.searchParams.set("translation", e.target.value);
              window.history.replaceState(null, "", url);
            }}
          >
            {catalog.translations.map((t) => (
              <option value={t.key} key={t.key}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Arabic text size
          <select
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          >
            <option value={30}>Small</option>
            <option value={34}>Medium</option>
            <option value={40}>Large</option>
          </select>
        </label>
      </div>
      <TajweedSettings
        enabled={tajweed}
        setEnabled={setTajweed}
        choices={tajweedChoices}
        setChoices={setTajweedChoices}
      />
      <div
        className="quran-reading"
        aria-busy={reading.pending}
        data-loading={reading.pending}
      >
        {reading.pending && (
          <p className="quran-load-status" role="status">
            Loading {catalog.suras[surah - 1].name_translit}…
          </p>
        )}
        <div
          key={reading.key}
          className="quran-reading-content"
          data-entering={
            reading.key !==
            resourceKey(
              quranUrls(
                initial.surah,
                initial.translationKey ?? "english_saheeh",
              ),
            )
          }
        >
          <h2 className="quiz-prompt">
            {info.name_translit}{" "}
            <span lang="ar" dir="rtl">
              {info.name_ar}
            </span>
          </h2>
          <p className="daily-muted">
            {info.name_en} · {info.ayas} verses · {info.revelation}
          </p>
          {reading.error && (
            <p className="daily-error" role="alert">
              {reading.error}{" "}
              <button className="daily-link" onClick={reading.retry}>
                Retry
              </button>
            </p>
          )}
          <div
            className="quran-verses"
            style={{ "--quran-size": `${size}px` } as CSSProperties}
          >
            {first && first.basmala > 0 && (
              <p className="quran-basmala" lang="ar" dir="rtl">
                <TajweedText
                  text={[...first.text]
                    .slice(0, first.basmala)
                    .join("")
                    .trimEnd()}
                  spans={spansBefore(first.tajweed ?? [], first.basmala)}
                  enabled={tajweed}
                  choices={tajweedChoices}
                />
              </p>
            )}
            {chapter.verses.map((v) => {
              const english = translated.verses.find((t) => t.aya === v.aya);
              return (
                <article
                  className="quran-ayah"
                  id={`ayah-${v.aya}`}
                  data-selected={hash === `#ayah-${v.aya}`}
                  key={v.aya}
                >
                  <p className="quran-arabic" lang="ar" dir="rtl">
                    <TajweedText
                      text={
                        v.basmala > 0
                          ? [...v.text].slice(v.basmala).join("")
                          : v.text
                      }
                      spans={spansAfter(v.tajweed ?? [], v.basmala)}
                      enabled={tajweed}
                      choices={tajweedChoices}
                    />
                  </p>
                  {english ? (
                    <>
                      <p className="quran-translation">{english.text}</p>
                      {english.footnotes && (
                        <details>
                          <summary>Translation notes</summary>
                          <p>{english.footnotes}</p>
                        </details>
                      )}
                    </>
                  ) : (
                    <p
                      className="daily-muted"
                      role={reading.error ? "alert" : "status"}
                    >
                      {reading.error ?? "Loading translation…"}
                      {reading.error && (
                        <button onClick={reading.retry} className="daily-link">
                          Retry translation
                        </button>
                      )}
                    </p>
                  )}
                  <div className="quran-verse-actions">
                    <span>
                      {displayedSurah}:{v.aya}
                    </span>
                    <button
                      onClick={() =>
                        setBookmark(
                          toggleBookmark(bookmark, {
                            surah: displayedSurah,
                            ayah: v.aya,
                          }),
                        )
                      }
                      disabled={reading.pending}
                      aria-label={`${bookmark?.surah === displayedSurah && bookmark?.ayah === v.aya ? "Remove bookmark for" : "Bookmark"} verse ${displayedSurah}:${v.aya}`}
                      aria-pressed={
                        bookmark?.surah === displayedSurah &&
                        bookmark?.ayah === v.aya
                      }
                    >
                      <Bookmark
                        size={16}
                        fill={
                          bookmark?.surah === displayedSurah &&
                          bookmark?.ayah === v.aya
                            ? "currentColor"
                            : "none"
                        }
                      />{" "}
                      {bookmark?.surah === displayedSurah &&
                      bookmark?.ayah === v.aya
                        ? "Remove bookmark"
                        : "Save verse"}
                    </button>
                    <button
                      disabled={reading.pending || !english}
                      aria-label={`Share verse ${displayedSurah}:${v.aya}`}
                      onClick={() =>
                        setShareVerse({
                          surah: displayedSurah,
                          ayah: v.aya,
                          name: info.name_translit,
                          arabic:
                            v.basmala > 0
                              ? [...v.text].slice(v.basmala).join("")
                              : v.text,
                          translation: english?.text ?? "",
                        })
                      }
                    >
                      <Share2 size={16} /> Share ayah
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
      <div className="daily-controls" aria-label="Surah navigation">
        <button
          className="daily-action"
          disabled={surah === 1}
          onClick={() => {
            go(surah - 1);
            window.scrollTo({ top: 0 });
          }}
        >
          <ArrowLeft size={17} /> Previous surah
        </button>
        <button
          className="daily-action"
          disabled={surah === 114}
          onClick={() => {
            go(surah + 1);
            window.scrollTo({ top: 0 });
          }}
        >
          Next surah <ArrowRight size={17} />
        </button>
      </div>
      {shareVerse && (
        <VerseShare
          verse={shareVerse}
          translationKey={selected.key}
          translationName={selected.name}
          translationAttribution={selected.attribution}
          onClose={() => setShareVerse(null)}
        />
      )}
      <div className="daily-sources">
        <p>
          Quran text courtesy of the{" "}
          <a href="https://tanzil.net/" target="_blank" rel="noreferrer">
            Tanzil Project
          </a>
          , unmodified · Uthmani v1.1.
        </p>
        <p>
          {selected.attribution} · {selected.version} · {selected.license}.{" "}
          <a href={selected.url} target="_blank" rel="noreferrer">
            Translation source
          </a>
        </p>
        <details>
          <summary>Text copyright and attribution</summary>
          <pre>{catalog.notice}</pre>
        </details>
      </div>
    </>
  );
}
