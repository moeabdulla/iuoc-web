import type { Metadata } from "next";
import Link from "next/link";
import {
  Calendar,
  Clapperboard,
  GraduationCap,
  MapPin,
  MessageCircle,
} from "lucide-react";
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
    icon: GraduationCap,
    title: "Lecture-style videos",
    description:
      "In-depth lessons on Quran, science, philosophy, and psychology, for viewers who want to sit with an idea and go deep.",
  },
  {
    icon: MessageCircle,
    title: "Short reminders",
    description:
      "Bite-sized reflections built for the in-between moments, each one carrying a single idea worth carrying with you.",
  },
  {
    icon: Clapperboard,
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
      <header className="max-w-2xl">
        <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          <span aria-hidden className="h-px w-6 bg-primary/60" />
          Who we are
        </p>
        <h1 className="font-serif text-4xl leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
          Islamic knowledge, made for everyone &mdash; free, forever.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          Project IUoC creates free, high-quality Islamic educational content
          for the whole world. Our lecture-style videos, short reminders, and
          animated series carry topics like Islam, Quran and Science,
          Philosophy, and Psychology to Muslims and non-Muslims alike, in
          every corner of the globe.
        </p>

        <dl className="mt-10 grid grid-cols-1 gap-6 border-t border-border/60 pt-8 sm:grid-cols-3 sm:gap-8">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-serif text-2xl tracking-tight text-primary sm:text-3xl">
                {stat.value}
              </dd>
              <dd className="mt-1 text-xs leading-snug text-muted-foreground sm:text-sm">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </header>

      <section aria-labelledby="formats-heading">
        <SectionHeading
          id="formats-heading"
          eyebrow="What we make"
          title="Three formats, one mission"
        />
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-3">
          {formats.map(({ icon: Icon, title, description }) => (
            <div key={title}>
              <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-5 font-serif text-xl tracking-tight">
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
          eyebrow="Topics we cover"
          title="From the Quran to the cosmos"
        />
        <ul className="flex flex-wrap gap-3">
          {topics.map((topic) => (
            <li
              key={topic}
              className="rounded-full border border-border/70 bg-card/60 px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:border-primary/50 hover:text-primary"
            >
              {topic}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="story-heading">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary/[0.06] px-6 py-14 text-center md:px-16 md:py-20">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-48 w-[36rem] max-w-full rounded-full bg-primary/20 blur-3xl"
          />
          <div className="relative mx-auto max-w-2xl">
            <p className="mb-4 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <MapPin className="size-3.5" aria-hidden />
              Based in Canada
              <Calendar className="size-3.5" aria-hidden />
              Since 2019
            </p>
            <h2
              id="story-heading"
              className="font-serif text-3xl leading-tight tracking-tight md:text-4xl"
            >
              Daily educational content, for over half a decade.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              The project has been producing daily educational content since
              2019 &mdash; over 650 videos across series like the Seerah of
              Prophet Muhammad (peace be upon him), Scientific Miracles of the
              Quran, Learn Tajweed, and Stories of the Prophets.
            </p>

            <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-11 px-7">
                <Link href="/videos">Browse the library</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-11 px-7">
                <Link href="/support">Support the project</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
