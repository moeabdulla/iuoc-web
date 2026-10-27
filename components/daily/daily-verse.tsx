"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Share2 } from "lucide-react";
import verses from "@/data/verses/daily.json";
import { dailyVerseIndex, shareTranslation } from "@/lib/daily/verse-share";
import { useLocalDay } from "@/lib/daily/use-local-day";
import { VerseShare } from "./verse-share";
export function DailyVerse({ showHeading = true }: { showHeading?: boolean }) {
  const today = useLocalDay();
  const [sharing, setSharing] = useState(false);
  const verse = today
    ? verses.verses[
        dailyVerseIndex(new Date(`${today}T12:00:00`), verses.verses.length)
      ]
    : null;
  return (
    <section
      className="daily-verse-card"
      data-standalone={!showHeading}
      aria-labelledby={showHeading ? "daily-verse-title" : undefined}
      aria-label={showHeading ? undefined : "Today’s verse"}
    >
      {showHeading && <h2 id="daily-verse-title">Daily quote</h2>}
      {verse ? (
        <>
          <blockquote>
            <p className="daily-verse-arabic" lang="ar" dir="rtl">
              {verse.arabic}
            </p>
            <p className="daily-verse-translation">
              {shareTranslation(verse.translation, verse.ayah)}
            </p>
            <p className="daily-verse-reference">
              {verse.name} · Quran {verse.surah}:{verse.ayah}
            </p>
          </blockquote>
          <div className="daily-verse-actions">
            <button onClick={() => setSharing(true)}>
              <Share2 size={17} /> Share quote
            </button>
            <Link href={`/quran?surah=${verse.surah}#ayah-${verse.ayah}`}>
              Read in surah <ArrowRight size={17} />
            </Link>
          </div>
          {sharing && (
            <VerseShare verse={verse} onClose={() => setSharing(false)} />
          )}
        </>
      ) : (
        <p role="status">Loading today’s quote…</p>
      )}
    </section>
  );
}
