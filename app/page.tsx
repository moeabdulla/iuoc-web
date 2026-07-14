import Image from "next/image";
import Link from "next/link";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { VideoCard, formatDuration } from "@/components/video-card";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

export const revalidate = 3600;

// A tighter latest section than before: one lead plate plus a small grid.
const LATEST_LIMIT = 7;
const TOC_LIMIT = 6;

const supportOptions = [
  { href: siteConfig.links.patreon, label: "Patreon", note: "Monthly" },
  { href: siteConfig.links.gofundme, label: "GoFundMe", note: "One-time" },
  { href: siteConfig.links.paypal, label: "PayPal", note: "Direct" },
];

export default async function HomePage() {
  const [featured, latest, playlists] = await Promise.all([
    fetchQuery(api.videos.featured, {}),
    fetchQuery(api.videos.latest, { limit: LATEST_LIMIT }),
    fetchQuery(api.playlists.listVisible, {}),
  ]);

  const [leadFeature, ...restFeatured] = featured;
  const [leadLatest, ...compactLatest] = latest;
  const series = playlists.slice(0, TOC_LIMIT);

  return (
    <>
      <Hero />

      <div className="container space-y-8 pb-8">
        {leadFeature && (
          <section aria-labelledby="featured-heading">
            <SectionHeading
              id="featured-heading"
              eyebrow="Featured"
              title="Worth your time"
            />
            <FeaturedPlate video={leadFeature} />
            {restFeatured.length > 0 && (
              <div className="mt-10 grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-x-6 md:grid-cols-3">
                {restFeatured.map((video) => (
                  <VideoCard key={video._id} video={video} compact />
                ))}
              </div>
            )}
          </section>
        )}

        <section aria-labelledby="latest-heading">
          <SectionHeading
            id="latest-heading"
            eyebrow="Chapter I"
            title="Latest Lectures"
          />
          {latest.length === 0 ? (
            <ComingSoon />
          ) : (
            <>
              {leadLatest && (
                <div className="mx-auto max-w-3xl">
                  <VideoCard video={leadLatest} />
                </div>
              )}
              {compactLatest.length > 0 && (
                <div className="mt-10 grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-x-5 md:grid-cols-3">
                  {compactLatest.map((video) => (
                    <VideoCard key={video._id} video={video} compact />
                  ))}
                </div>
              )}
              <p className="mt-10 text-center">
                <Link
                  href="/videos"
                  className="font-serif text-sm italic text-primary underline-offset-4 hover:underline"
                >
                  &mdash; view all lectures &mdash;
                </Link>
              </p>
            </>
          )}
        </section>

        {series.length > 0 && (
          <section aria-labelledby="series-heading">
            <SectionHeading
              id="series-heading"
              eyebrow="Chapter II"
              title="The Series"
              stars={2}
            />
            <nav aria-label="Series" className="mx-auto max-w-3xl">
              <ol>
                {series.map((playlist) => (
                  <TocRow key={playlist._id} playlist={playlist} />
                ))}
              </ol>
            </nav>
            <p className="mt-8 text-center">
              <Link
                href="/videos"
                className="font-serif text-sm italic text-primary underline-offset-4 hover:underline"
              >
                &mdash; view the full table of contents &mdash;
              </Link>
            </p>
          </section>
        )}

        <Colophon />
      </div>
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        aria-hidden
        className="pt-8 text-center text-sm tracking-[0.6em] text-gold"
      >
        &#10022; &#10022; &#10022;
      </div>
      <div className="container py-12 text-center md:py-20">
        <div className="mx-auto max-w-2xl">
          {/* The basmala ligature's advance is wider than the mobile column,
              and dir=rtl pins an over-wide line to one edge — which reads as
              off-centre. A flex row centres the glyph's box symmetrically
              (overflow spills equally both sides), so the visible calligraphy
              sits optically centred at every width without any body scroll. */}
          <div className="flex justify-center">
            <p
              lang="ar"
              dir="rtl"
              className="w-max whitespace-nowrap font-arabic leading-none text-primary [font-size:clamp(1.75rem,8vw,3rem)]"
            >
              &#65021;
            </p>
          </div>

          <h1 className="mt-7 font-serif text-[2.1rem] font-medium italic leading-[1.2] sm:text-4xl md:text-5xl">
            <span className="text-gold">&ldquo;</span>
            <span className="illumine-sheen">
              <span className="illumine-lit">Convey</span> from me, even{" "}
              <span className="illumine-lit">a single verse</span>.
            </span>
            <span className="text-gold">&rdquo;</span>
          </h1>

          <p className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            &mdash; The Prophet Muhammad{" "}
            <span lang="ar" className="font-arabic text-base text-primary">
              &#65018;
            </span>
          </p>

          <p className="mx-auto mt-7 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
            {siteConfig.description}
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-none px-7 shadow-none"
            >
              <Link href="/videos">Browse the library</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-none border-primary bg-transparent px-7 text-primary shadow-none hover:bg-primary/10 hover:text-primary"
            >
              <Link href="/support">Support us</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedPlate({ video }: { video: Doc<"videos"> }) {
  return (
    <Link
      href={`/videos/${video.slug}`}
      className="group mx-auto grid max-w-4xl overflow-hidden border border-foreground bg-secondary md:grid-cols-2"
    >
      <div className="p-1.5">
        <div className="relative aspect-video overflow-hidden border border-gold">
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
          />
          {video.durationSeconds > 0 && (
            <span className="absolute bottom-1.5 right-1.5 border border-foreground bg-background px-1.5 py-0.5 text-[0.7rem] tabular-nums text-foreground">
              {formatDuration(video.durationSeconds)}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col justify-center gap-3 p-6 text-center md:p-9 md:text-left">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-accent-red">
          The Featured Plate
        </p>
        <h3 className="font-serif text-2xl leading-tight transition-colors group-hover:text-primary md:text-3xl">
          {video.title}
        </h3>
        {video.description && (
          <p className="line-clamp-3 text-sm italic leading-relaxed text-muted-foreground md:text-base">
            {video.description}
          </p>
        )}
        <span className="mt-1 font-serif text-sm italic text-primary">
          Watch now &rarr;
        </span>
      </div>
    </Link>
  );
}

function TocRow({ playlist }: { playlist: Doc<"playlists"> }) {
  const count =
    playlist.itemCount > 0
      ? `${playlist.itemCount} lecture${playlist.itemCount === 1 ? "" : "s"}`
      : "New series";

  return (
    <li>
      <Link
        href={`/series/${playlist.youtubeId}`}
        className="group flex items-center gap-3.5 border-b border-border py-3 md:gap-4"
      >
        <span className="relative aspect-video w-16 shrink-0 overflow-hidden border border-foreground/60 bg-secondary sm:w-20">
          <Image
            src={playlist.thumbnail}
            alt=""
            fill
            sizes="80px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </span>
        <span className="min-w-0 shrink font-serif text-base font-medium transition-colors group-hover:text-primary md:text-lg">
          {playlist.title}
        </span>
        <span
          aria-hidden
          className="min-w-4 flex-1 self-center border-b border-dotted border-border"
        />
        <span className="shrink-0 self-center whitespace-nowrap font-serif text-sm italic text-muted-foreground">
          {count}
        </span>
      </Link>
    </li>
  );
}

function Colophon() {
  return (
    <section aria-labelledby="support-heading" className="relative pt-4">
      <div className="relative mx-auto max-w-2xl border border-foreground bg-secondary px-6 py-12 text-center md:px-12">
        <span
          aria-hidden
          className="absolute -top-3 left-1/2 -translate-x-1/2 bg-background px-3 text-gold"
        >
          &#10022;
        </span>
        <h2
          id="support-heading"
          className="font-serif text-2xl leading-tight md:text-3xl"
        >
          Keep this knowledge free.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
          Every lecture, reminder, and animation is produced at no cost to the
          viewer. Your support carries this work forward &mdash; a charity that
          keeps giving.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {supportOptions.map((option, index) => (
            <a
              key={option.label}
              href={option.href}
              target="_blank"
              rel="noopener noreferrer"
              className={
                "border px-5 py-2.5 text-sm transition-colors " +
                (index === 0
                  ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border-primary bg-transparent text-primary hover:bg-primary/10")
              }
            >
              <span className="font-medium">{option.label}</span>
              <span className="ml-1.5 text-xs opacity-80">{option.note}</span>
            </a>
          ))}
        </div>

        <p className="mt-8 text-xs uppercase tracking-[0.28em] text-gold">
          Sadaqah Jariyah
        </p>
      </div>
    </section>
  );
}

function ComingSoon() {
  return (
    <div className="mx-auto max-w-xl border border-border bg-secondary/50 px-6 py-16 text-center">
      <div aria-hidden className="text-sm tracking-[0.5em] text-gold">
        &#10022;
      </div>
      <h3 className="mt-4 font-serif text-2xl">Content is on its way</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm italic text-muted-foreground">
        New lectures are being prepared. In the meantime, follow along on
        YouTube to be the first to watch.
      </p>
      <Button
        asChild
        variant="outline"
        className="mt-6 rounded-none border-primary bg-transparent text-primary shadow-none hover:bg-primary/10 hover:text-primary"
      >
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
