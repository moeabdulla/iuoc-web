import { DailyVerse } from "@/components/daily/daily-verse";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";
import { ToolIcon } from "./art";
import {
  CourtyardVideo,
  FeaturedLesson,
  SeriesCards,
  SectionTitle,
} from "./cards";

export function DailyTools() {
  const tools = [
    {
      name: "daily-question",
      title: "Daily question",
      href: "/daily-question",
    },
    { name: "quran", title: "Read the Quran", href: "/quran" },
    { name: "prayer-times", title: "Prayer times", href: "/prayer-times" },
  ];
  return (
    <nav className="courtyard-tools" aria-label="Daily tools" id="daily-tools">
      {tools.map((t) => (
        <Link key={t.name} href={t.href}>
          <ToolIcon name={t.name} />
          <span>
            {t.title}
            <ArrowRight size={18} aria-hidden="true" />
          </span>
        </Link>
      ))}
    </nav>
  );
}
export function HomeContent({
  featured,
  latest,
  series,
}: {
  featured: Doc<"videos">[];
  latest: Doc<"videos">[];
  series: Doc<"playlists">[];
}) {
  const feature = featured[0] ?? latest.find((v) => !v.isShort) ?? latest[0];
  const recent = latest.filter((v) => v._id !== feature?._id).slice(0, 3);
  return (
    <>
      <div className="courtyard-arrival">
        <section
          className="courtyard-paper courtyard-library-intro"
          aria-labelledby="library-heading"
        >
          <div className="courtyard-section-title">
            <span className="courtyard-kicker" aria-hidden="true" />
            <h2 id="library-heading" tabIndex={-1}>
              The library
            </h2>
          </div>
          <DailyTools />
          <DailyVerse />
          <section
            className="courtyard-feature-section"
            aria-labelledby="featured-title"
          >
            <SectionTitle title="Featured lesson" id="featured-title" />
            {feature ? (
              <FeaturedLesson video={feature} />
            ) : (
              <p>Explore our lessons in the library.</p>
            )}
          </section>
        </section>
      </div>
      <div className="reading-scene-home">
        <div className="courtyard-reading-panels">
          <section
            className="courtyard-paper courtyard-lessons"
            aria-labelledby="latest-title"
          >
            <SectionTitle
              title="Latest lessons"
              id="latest-title"
              href="/videos"
            />
            <div className="courtyard-lesson-grid">
              {recent.map((v) => (
                <CourtyardVideo video={v} key={v._id} />
              ))}
            </div>
          </section>
          <section
            className="courtyard-paper courtyard-series"
            aria-labelledby="series-title"
          >
            <SectionTitle
              title="Series"
              id="series-title"
              href="/videos?view=series"
              linkText="View all series"
            />
            <SeriesCards series={series.slice(0, 3)} />
          </section>
        </div>
      </div>
      <section className="courtyard-closing-scene" aria-label="App and support">
        <div className="courtyard-close">
          <article>
            <ToolIcon name="app" />
            <div>
              <h2>IUoC app</h2>
              <p>Access the library on the go.</p>
              <Link href="/app" className="courtyard-button">
                Get the app
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </article>
          <article>
            <ToolIcon name="support" />
            <div>
              <h2>Support the project</h2>
              <p>Help keep Islamic knowledge accessible to everyone.</p>
              <Link href="/support" className="courtyard-button">
                Support
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
