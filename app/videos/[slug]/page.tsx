import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { siteConfig } from "@/lib/site";
import { stripHashtags } from "@/lib/strip-hashtags";
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
    alternates: { canonical: `${siteConfig.url}/videos/${video.slug}` },
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

      <div className="mt-8 md:mt-10">
        <YouTubeEmbed youtubeId={video.youtubeId} title={video.title} />
      </div>

      <div className="mt-8 md:mt-10">
        <h1 className="font-serif text-3xl leading-[1.12] md:text-4xl lg:text-5xl">
          {stripHashtags(video.title)}
        </h1>

        <p className="mt-4 font-serif text-sm italic text-muted-foreground">
          <time dateTime={new Date(video.publishedAt).toISOString()}>
            {publishedDate}
          </time>
          {video.durationSeconds > 0 && (
            <> &middot; {formatDuration(video.durationSeconds)}</>
          )}
        </p>

        {series.length > 0 && (
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs uppercase tracking-[0.2em]">
            {series.map((playlist) => (
              <Link
                key={playlist.youtubeId}
                href={`/series/${playlist.youtubeId}`}
                className="text-gold transition-colors hover:text-primary"
              >
                {playlist.title}
              </Link>
            ))}
          </p>
        )}
      </div>

      <div className="mt-6 border-t border-border pt-6 md:mt-8 md:pt-8">
        <VideoDescription description={video.description} />

        <a
          href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-8 inline-flex items-center gap-2 rounded-none border border-primary bg-transparent px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
        >
          Watch on YouTube
          <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </div>

      {relatedVideos.length > 0 && (
        <section aria-label="More videos" className="mt-16 md:mt-20">
          <SectionHeading
            eyebrow="Further Reading"
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
