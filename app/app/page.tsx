import { ReadingShell } from "@/components/courtyard/reading-shell";
import type { Metadata } from "next";
import { DecodedImage } from "@/components/courtyard/decoded-image";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  Clock,
  Compass,
  PlayCircle,
  Puzzle,
  WifiOff,
} from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";

// Drawn inline rather than pulled from a CDN, so the page has no external
// dependency and the marks inherit the button's text colour. Both are the
// store glyphs only — the full "Download on the App Store" lockups are brand
// artwork with their own placement rules, and a button that already says the
// words does not need them.
function AppleMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 384 512" fill="currentColor" aria-hidden {...props}>
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

function GooglePlayMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087zm12.207 10.065l3.258-3.238L2.99.14a1.474 1.474 0 0 0-.936-.14zm0 2.067L2.054 24.04c.302.036.615-.16.913-.169l14.046-7.954z" />
    </svg>
  );
}

export const metadata: Metadata = {
  title: "The App",
  description:
    "Project IUoC's whole library in one app \u2014 lessons, series and short reminders \u2014 with the Quran, prayer times, the qibla and a question each day. Free, no account, works offline.",
};

const APP_STORE = "https://apps.apple.com/app/id6803721415";
const PLAY_STORE = "https://play.google.com/store/apps/details?id=com.iuoc.app";

/**
 * Set true by the owner ahead of approval. At the time of writing Apple still
 * reports 1.0.0 as WAITING_FOR_REVIEW and `itunes.apple.com/lookup` returns no
 * result, so the App Store link 404s until the release goes live. Flip back to
 * false to show "On the App Store soon" instead.
 */
const IOS_LIVE = true;

const shots = [
  {
    src: "/app/library.png",
    alt: "The IUoC library, with the newest reminder and recent lectures",
    caption: "The library",
  },
  {
    src: "/app/question.png",
    alt: "The daily question, answered, showing the verse it came from",
    caption: "A question each day",
  },
  {
    src: "/app/reader.png",
    alt: "The Quran reader with tajweed colouring and the end-of-ayah marks",
    caption: "The Quran, with tajweed",
  },
  {
    src: "/app/prayer.png",
    alt: "Prayer times for the day, with a sound chosen per prayer",
    caption: "Prayer times",
  },
];

const features = [
  {
    icon: PlayCircle,
    title: "Lessons and series",
    body: "Project IUoC's whole library inside the app: lecture-style deep dives, short reminders and animated series, grouped into series like the Seerah, the 99 Names, Intro to Islam and Tajweed. Turn on alerts to hear when something new is posted.",
  },
  {
    icon: Puzzle,
    title: "A question each day",
    body: "One question a day, the same one for everyone, drawn from the Quran and from the videos. A wrong answer explains itself and points at the verse it came from, instead of marking you down.",
  },
  {
    icon: BookOpen,
    title: "The whole Quran",
    body: "The Uthmani text from the Tanzil Project with six English translations, optional tajweed colouring, and search in either language.",
  },
  {
    icon: Clock,
    title: "Prayer times",
    body: "The five prayers wherever you are, with the method your community follows \u2014 including Ja'fari with the Tehran or Leva Institute (Qom) angles \u2014 and a different sound for each prayer.",
  },
  {
    icon: Compass,
    title: "Qibla",
    body: "The direction of the Kaaba worked out on your device from true north, not magnetic north, which is off by as much as twenty degrees.",
  },
  {
    icon: CalendarDays,
    title: "Hijri calendar",
    body: "Today on the Umm al-Qura calendar, with both calendars in every cell and an offset if your community begins the month a day apart.",
  },
];

export default function AppPage() {
  return (
    <ReadingShell className="reading-info">
      <div className="space-y-14 md:space-y-20">
        <header className="mx-auto max-w-2xl text-center">
          <div aria-hidden className="text-sm tracking-[0.6em] text-gold">
            &#10022; &#10022; &#10022;
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-gold">
            The IUoC App
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-[1.1] md:text-5xl">
            Everything IUoC teaches, in one app.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            The whole library &mdash; lectures, short reminders and animated
            series &mdash; with the Quran, your prayer times and the qibla
            alongside it, so there is a reason to open it every day. Free, no
            account, and it all works offline.
          </p>

          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
            {IOS_LIVE ? (
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto sm:min-w-[17rem]"
              >
                <a href={APP_STORE} target="_blank" rel="noreferrer">
                  <AppleMark />
                  Download on the App Store
                </a>
              </Button>
            ) : (
              <Button
                size="lg"
                disabled
                className="w-full sm:w-auto sm:min-w-[17rem]"
              >
                <AppleMark />
                On the App Store soon
              </Button>
            )}
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto sm:min-w-[17rem]"
            >
              <a href={PLAY_STORE} target="_blank" rel="noreferrer">
                <GooglePlayMark />
                Get it on Google Play
              </a>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Free on iPhone, iPad and Android.
          </p>
        </header>

        <section>
          <SectionHeading
            eyebrow="A Look Inside"
            title="What you get"
            stars={2}
          />
          <ul className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
            {shots.map((shot) => (
              <li key={shot.src} className="space-y-3">
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                  <DecodedImage
                    src={shot.src}
                    alt={shot.alt}
                    width={640}
                    height={1391}
                    className="h-auto w-full"
                    sizes="(min-width: 768px) 22vw, 45vw"
                  />
                </div>
                <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {shot.caption}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <SectionHeading
            eyebrow="Everything In It"
            title="Teaching first, and the things you open daily"
            stars={2}
          />
          <ul className="grid gap-8 md:grid-cols-2 md:gap-10">
            {features.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4">
                <span aria-hidden className="mt-1 text-gold">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-serif text-xl">{title}</h3>
                  <p className="mt-2 text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto max-w-2xl text-center">
          <span aria-hidden className="text-gold">
            <WifiOff className="mx-auto size-6" />
          </span>
          <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
            Nothing about you leaves your phone.
          </h2>
          <p className="mt-4 text-muted-foreground">
            There is no account to create and no server to reach. Your location
            is used on the device to work out prayer times and the qibla, and is
            never sent anywhere. Bookmarks and settings can be backed up to your
            own iCloud, which goes to your account rather than to us.
          </p>
          <p className="mt-6">
            <Link
              href="/app/privacy"
              className="text-primary underline-offset-4 hover:underline"
            >
              Read the privacy policy
            </Link>
          </p>
        </section>
      </div>
    </ReadingShell>
  );
}
