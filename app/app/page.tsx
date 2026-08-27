import type { Metadata } from "next";
import Image from "next/image";
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

export const metadata: Metadata = {
  title: "The App",
  description:
    "IUoC is a free Quran reader, prayer times, qibla compass and Hijri calendar, with Project IUoC's lessons and a question each day. No account, no ads, works offline.",
};

const APP_STORE = "https://apps.apple.com/app/id6803721415";
const PLAY_STORE =
  "https://play.google.com/store/apps/details?id=com.iuoc.app";

/**
 * The App Store listing 404s until Apple approves the first release, and a
 * button that leads nowhere is worse than one that says "soon". Flip this to
 * true the day it goes live — that is the only change needed.
 */
const IOS_LIVE = false;

const shots = [
  { src: "/app/prayer.png", alt: "Prayer times for the day, with the next prayer and a sound chosen per prayer", caption: "Prayer times" },
  { src: "/app/verse.png", alt: "The home screen, with the day's verse in Arabic and English", caption: "A verse each day" },
  { src: "/app/reader.png", alt: "The Quran reader with tajweed colouring and the end-of-ayah marks", caption: "The Quran, with tajweed" },
  { src: "/app/question.png", alt: "The daily question, answered, showing the verse it came from", caption: "A question each day" },
];

const features = [
  { icon: BookOpen, title: "The whole Quran", body: "The Uthmani text from the Tanzil Project with six English translations, optional tajweed colouring, and search in either language." },
  { icon: Clock, title: "Prayer times", body: "The five prayers wherever you are, with the method your community follows — including Ja'fari with the Tehran or Leva Institute (Qom) angles — and a different sound for each prayer." },
  { icon: Compass, title: "Qibla", body: "The direction of the Kaaba worked out on your device from true north, not magnetic north, which is off by as much as twenty degrees." },
  { icon: PlayCircle, title: "Lessons and series", body: "Project IUoC's library inside the app, grouped into series, with an alert when something new is posted." },
  { icon: Puzzle, title: "A question each day", body: "One question a day, the same one for everyone. A wrong answer explains itself instead of marking you down." },
  { icon: CalendarDays, title: "Hijri calendar", body: "Today on the Umm al-Qura calendar, with both calendars in every cell and an offset if your community begins the month a day apart." },
];

export default function AppPage() {
  return (
    <div className="container space-y-20 pb-24 pt-14 md:space-y-28 md:pt-20">
      <header className="mx-auto max-w-2xl text-center">
        <div aria-hidden className="text-sm tracking-[0.6em] text-gold">
          &#10022; &#10022; &#10022;
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-gold">
          The IUoC App
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-[1.1] md:text-5xl">
          The Quran, your prayer times, and a question each day.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Free, with no account, no ads and nothing sent anywhere. Everything
          ships inside the app, so it all works in airplane mode.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <a href={PLAY_STORE} target="_blank" rel="noreferrer">
              Get it on Google Play
            </a>
          </Button>
          {IOS_LIVE ? (
            <Button asChild size="lg" variant="outline">
              <a href={APP_STORE} target="_blank" rel="noreferrer">
                Download on the App Store
              </a>
            </Button>
          ) : (
            <Button size="lg" variant="outline" disabled>
              On the App Store soon
            </Button>
          )}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Android now. iPhone and iPad are with Apple for review.
        </p>
      </header>

      <section>
        <SectionHeading eyebrow="A Look Inside" title="What you get" stars={2} />
        <ul className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {shots.map((shot) => (
            <li key={shot.src} className="space-y-3">
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <Image
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
        <SectionHeading eyebrow="Everything In It" title="Built to stay out of the way" stars={2} />
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
          There is no account to create and no server to reach. Your location is
          used on the device to work out prayer times and the qibla, and is
          never sent anywhere. Bookmarks and settings can be backed up to your
          own iCloud, which goes to your account rather than to us.
        </p>
        <p className="mt-6">
          <Link href="/app/privacy" className="text-primary underline-offset-4 hover:underline">
            Read the privacy policy
          </Link>
        </p>
      </section>
    </div>
  );
}
