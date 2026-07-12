import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
};

const stats = [
  { value: "650+", label: "Videos and counting" },
  { value: "Worldwide", label: "Muslim & non-Muslim viewers" },
  { value: "Free", label: "Forever, for everyone" },
];

const formats = [
  {
    numeral: "I",
    title: "Lecture-style videos",
    description:
      "In-depth lessons on Quran, science, philosophy, and psychology, for viewers who want to sit with an idea and go deep.",
  },
  {
    numeral: "II",
    title: "Short reminders",
    description:
      "Bite-sized reflections built for the in-between moments, each one carrying a single idea worth carrying with you.",
  },
  {
    numeral: "III",
    title: "Animated series",
    description:
      "Stories and concepts brought to life frame by frame, made to reach viewers of every age and background.",
  },
];

const topics = [
  "Quran & Science",
  "Philosophy",
  "Psychology",
  "Seerah of the Prophet",
  "Tajweed",
  "Stories of the Prophets",
  "Scientific Miracles of the Quran",
  "Islamic History",
];

export default function AboutPage() {
  return (
    <div className="container space-y-20 pb-24 pt-14 md:space-y-28 md:pt-20">
      <header className="mx-auto max-w-2xl text-center">
        <div aria-hidden className="text-sm tracking-[0.6em] text-gold">
          &#10022; &#10022; &#10022;
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-gold">
          Who We Are
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-[1.1] md:text-5xl">
          Islamic knowledge, made for everyone &mdash; free, forever.
        </h1>
        <p className="mx-auto mt-6 max-w-xl font-serif text-lg leading-relaxed text-foreground/80">
          Project IUoC creates free, high-quality Islamic educational content
          for the whole world. Our lecture-style videos, short reminders, and
          animated series carry topics like Islam, Quran and Science,
          Philosophy, and Psychology to Muslims and non-Muslims alike, in every
          corner of the globe.
        </p>

        <dl className="mx-auto mt-10 grid max-w-xl grid-cols-1 gap-6 border-t border-border pt-8 sm:grid-cols-3 sm:gap-8">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-serif text-2xl text-primary sm:text-3xl">
                {stat.value}
              </dd>
              <dd className="mt-1 text-xs italic leading-snug text-muted-foreground sm:text-sm">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </header>

      <section aria-labelledby="formats-heading">
        <SectionHeading
          id="formats-heading"
          eyebrow="What We Make"
          title="Three formats, one mission"
        />
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-3">
          {formats.map(({ numeral, title, description }) => (
            <div key={title} className="text-center sm:text-left">
              <p className="font-serif text-2xl italic text-gold">{numeral}</p>
              <h3 className="mt-3 border-t border-border pt-3 font-serif text-xl">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="topics-heading">
        <SectionHeading
          id="topics-heading"
          eyebrow="Topics We Cover"
          title="From the Quran to the cosmos"
        />
        <ul className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-x-4 gap-y-3">
          {topics.map((topic, index) => (
            <li
              key={topic}
              className="flex items-center gap-x-4 text-xs uppercase tracking-[0.18em] text-muted-foreground"
            >
              {topic}
              {index < topics.length - 1 && (
                <span aria-hidden className="text-gold">
                  &#10022;
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="story-heading">
        <div className="relative mx-auto max-w-2xl border border-foreground bg-secondary px-6 py-14 text-center md:px-16 md:py-16">
          <span
            aria-hidden
            className="absolute -top-3 left-1/2 -translate-x-1/2 bg-background px-3 text-gold"
          >
            &#10022;
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
            Based in Canada &middot; Since 2019
          </p>
          <h2
            id="story-heading"
            className="mt-4 font-serif text-3xl leading-tight md:text-4xl"
          >
            Daily educational content, for over half a decade.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            The project has been producing daily educational content since 2019
            &mdash; over 650 videos across series like the Seerah of Prophet
            Muhammad (peace be upon him), Scientific Miracles of the Quran, Learn
            Tajweed, and Stories of the Prophets.
          </p>

          <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-none px-7 shadow-none"
            >
              <Link href="/videos">Browse the library</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-none border-primary bg-transparent px-7 text-primary shadow-none hover:bg-primary/10 hover:text-primary"
            >
              <Link href="/support">Support the project</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
