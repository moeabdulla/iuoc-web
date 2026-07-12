import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { YouTubeEmbed } from "@/components/youtube-embed";
import { VideoCard, formatDuration } from "@/components/video-card";
import { VideoDescription } from "@/components/video-description";
import { SectionHeading } from "@/components/section-heading";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const video = await fetchQuery(api.videos.bySlug, { slug });
  if (!video) return {};
  return {
    title: video.title,
    description: video.description.slice(0, 160),
    openGraph: {
      title: video.title,
      description: video.description.slice(0, 160),
      images: [{ url: video.thumbnail }],
      type: "video.other",
    },
  };
}

export default async function VideoPage({ params }: Props) {
  const { slug } = await params;
  const video = await fetchQuery(api.videos.bySlug, { slug });
  if (!video) notFound();

  const [playlists, related] = await Promise.all([
    fetchQuery(api.playlists.listVisible, {}),
    video.playlistIds.length > 0
      ? fetchQuery(api.videos.byPlaylist, {
          playlistYoutubeId: video.playlistIds[0],
          limit: 9,
        })
      : fetchQuery(api.videos.latest, { limit: 9 }),
  ]);

  const relatedVideos = related
    .filter((v) => v.youtubeId !== video.youtubeId)
    .slice(0, 8);

  const series = playlists.filter((playlist) =>
    video.playlistIds.includes(playlist.youtubeId),
  );
  const primarySeries = series.find(
    (playlist) => playlist.youtubeId === video.playlistIds[0],
  );

  const publishedDate = new Date(video.publishedAt).toLocaleDateString(
    "en-CA",
    { year: "numeric", month: "long", day: "numeric" },
  );

  return (
    <article className="container max-w-4xl pb-24 pt-10 md:pb-32 md:pt-14">
      <Link
        href="/videos"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary md:mb-10"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to videos
      </Link>

      <YouTubeEmbed youtubeId={video.youtubeId} title={video.title} />

      <div className="mt-8 md:mt-10">
        <h1 className="font-serif text-3xl leading-[1.08] tracking-tight md:text-4xl lg:text-5xl">
          {video.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
          <time dateTime={new Date(video.publishedAt).toISOString()}>
            {publishedDate}
          </time>
          {video.durationSeconds > 0 && (
            <>
              <span aria-hidden className="text-border">
                •
              </span>
              <span>{formatDuration(video.durationSeconds)}</span>
            </>
          )}
        </div>

        {series.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {series.map((playlist) => (
              <Link
                key={playlist.youtubeId}
                href={`/videos#series-${playlist.youtubeId}`}
                className="rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                {playlist.title}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 border-t border-border/60 pt-6 md:mt-8 md:pt-8">
        <VideoDescription description={video.description} />

        <a
          href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-5 py-2.5 text-sm font-semibold transition-colors hover:border-primary/50 hover:text-primary"
        >
          Watch on YouTube
          <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </div>

      {relatedVideos.length > 0 && (
        <section aria-label="More videos" className="mt-16 md:mt-20">
          <SectionHeading
            eyebrow={primarySeries ? "Series" : "Watch next"}
            title={
              primarySeries
                ? `More from ${primarySeries.title}`
                : "More from the catalogue"
            }
          />
          <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-4 px-4 pb-4 [scrollbar-width:thin] md:-mx-6 md:scroll-pl-6 md:px-6">
            {relatedVideos.map((relatedVideo) => (
              <li
                key={relatedVideo._id}
                className="w-60 shrink-0 snap-start sm:w-64 md:w-72"
              >
                <VideoCard video={relatedVideo} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
