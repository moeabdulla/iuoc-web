import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { VideoCard, formatDuration } from "@/components/video-card";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

export const revalidate = 3600;

const SERIES_LIMIT = 8;

const supportOptions = [
  {
    href: siteConfig.links.patreon,
    label: "Patreon",
    note: "Monthly support",
  },
  {
    href: siteConfig.links.gofundme,
    label: "GoFundMe",
    note: "One-time gift",
  },
  {
    href: siteConfig.links.paypal,
    label: "PayPal",
    note: "Direct donation",
  },
];

export default async function HomePage() {
  const [featured, latest, playlists] = await Promise.all([
    fetchQuery(api.videos.featured, {}),
    fetchQuery(api.videos.latest, { limit: 12 }),
    fetchQuery(api.playlists.listVisible, {}),
  ]);

  const [leadFeature, ...restFeatured] = featured;
  const series = playlists.slice(0, SERIES_LIMIT);

  return (
    <>
      <Hero />

      <div className="container space-y-24 pb-8 md:space-y-32">
        {leadFeature && (
          <section aria-labelledby="featured-heading">
            <SectionHeading
              id="featured-heading"
              eyebrow="Featured"
              title="Worth your time"
            />
            <FeaturedFilm video={leadFeature} />
            {restFeatured.length > 0 && (
              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {restFeatured.map((video) => (
                  <VideoCard key={video._id} video={video} />
                ))}
              </div>
            )}
          </section>
        )}

        <section aria-labelledby="latest-heading">
          <SectionHeading
            id="latest-heading"
            eyebrow="Fresh from the channel"
            title="Latest videos"
            action={{ href: "/videos", label: "View all" }}
          />
          {latest.length === 0 ? (
            <ComingSoon />
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {latest.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          )}
        </section>

        {series.length > 0 && (
          <section aria-labelledby="series-heading">
            <SectionHeading
              id="series-heading"
              eyebrow="Curated paths"
              title="Explore by series"
              action={{ href: "/videos", label: "All series" }}
            />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {series.map((playlist) => (
                <SeriesCard key={playlist._id} playlist={playlist} />
              ))}
            </div>
          </section>
        )}

        <SupportBand />
      </div>
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <Crescent />
      <div className="container relative py-20 md:py-28 lg:py-32">
        <div className="max-w-3xl">
          <p
            className="reveal-up mb-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur"
            style={{ animationDelay: "0ms" }}
          >
            <Sparkles className="size-3.5 text-primary" aria-hidden />
            Canadian Islamic education
          </p>

          <h1
            className="reveal-up font-serif text-[2.75rem] leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "90ms" }}
          >
            Deepen your understanding of Islam
            <span className="text-primary"> &mdash; beautifully</span>, and for
            free.
          </h1>

          <p
            className="reveal-up mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground"
            style={{ animationDelay: "180ms" }}
          >
            {siteConfig.description}
          </p>

          <div
            className="reveal-up mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ animationDelay: "270ms" }}
          >
            <Button
              asChild
              size="lg"
              className="h-12 gap-2 px-7 text-base shadow-lg shadow-primary/20"
            >
              <Link href="/videos">
                <Play className="size-4 fill-current" aria-hidden />
                Browse videos
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 gap-2 px-7 text-base"
            >
              <Link href="/support">
                Support the project
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Crescent() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -right-24 -top-24 hidden opacity-[0.09] md:block lg:-right-16"
    >
      <svg
        width="520"
        height="520"
        viewBox="0 0 520 520"
        fill="none"
        className="text-primary"
      >
        <defs>
          <mask id="crescent-mask">
            <rect width="520" height="520" fill="black" />
            <circle cx="260" cy="260" r="220" fill="white" />
            <circle cx="330" cy="220" r="200" fill="black" />
          </mask>
        </defs>
        <circle
          cx="260"
          cy="260"
          r="220"
          fill="currentColor"
          mask="url(#crescent-mask)"
        />
      </svg>
    </div>
  );
}

function FeaturedFilm({ video }: { video: Doc<"videos"> }) {
  return (
    <Link
      href={`/videos/${video.slug}`}
      className="group grid overflow-hidden rounded-2xl border border-border/60 bg-card/40 transition-colors hover:border-primary/40 md:grid-cols-2"
    >
      <div className="relative aspect-video overflow-hidden md:aspect-auto">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority
        />
        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow">
          <Sparkles className="size-3.5" aria-hidden />
          Featured
        </span>
        {video.durationSeconds > 0 && (
          <span className="absolute bottom-4 right-4 rounded bg-black/80 px-2 py-1 text-xs font-medium text-white">
            {formatDuration(video.durationSeconds)}
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
            <Play className="size-6 fill-current" aria-hidden />
          </span>
        </span>
      </div>

      <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
        <h3 className="font-serif text-2xl leading-tight tracking-tight md:text-3xl">
          {video.title}
        </h3>
        {video.description && (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            {video.description}
          </p>
        )}
        <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          Watch now
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function SeriesCard({ playlist }: { playlist: Doc<"playlists"> }) {
  return (
    <Link
      href={`/series/${playlist.youtubeId}`}
      className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-xl border border-border/60"
    >
      <Image
        src={playlist.thumbnail}
        alt=""
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"
      />
      <div className="relative p-4">
        <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/70">
          {playlist.itemCount > 0
            ? `${playlist.itemCount} video${playlist.itemCount === 1 ? "" : "s"}`
            : "New series"}
        </p>
        <h3 className="font-serif text-base font-semibold leading-snug text-white">
          {playlist.title}
        </h3>
      </div>
    </Link>
  );
}

function SupportBand() {
  return (
    <section aria-labelledby="support-heading">
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary/[0.06] px-6 py-14 text-center md:px-16 md:py-20">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-48 w-[36rem] max-w-full rounded-full bg-primary/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-2xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Sadaqah jariyah
          </p>
          <h2
            id="support-heading"
            className="font-serif text-3xl leading-tight tracking-tight md:text-4xl"
          >
            Keep this knowledge free for everyone.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Every video is produced and shared at no cost to the viewer. Your
            support pays for the research, animation, and production that carry
            this work forward &mdash; a continuous charity that keeps giving.
          </p>

          <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
            {supportOptions.map((option, index) => (
              <a
                key={option.label}
                href={option.href}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  "group flex flex-col items-center gap-0.5 rounded-xl border px-6 py-3 transition-colors " +
                  (index === 0
                    ? "border-transparent bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
                    : "border-border/70 bg-card/60 text-foreground hover:border-primary/50")
                }
              >
                <span className="text-sm font-semibold">{option.label}</span>
                <span
                  className={
                    "text-xs " +
                    (index === 0
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground")
                  }
                >
                  {option.note}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/30 px-6 py-20 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="size-5" aria-hidden />
      </span>
      <h3 className="font-serif text-2xl tracking-tight">
        Content is on its way
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        New videos are being prepared. In the meantime, follow along on YouTube
        to be the first to watch.
      </p>
      <Button asChild variant="outline" className="mt-6">
        <a
          href={siteConfig.links.youtube}
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit the channel
        </a>
      </Button>
    </div>
  );
}
