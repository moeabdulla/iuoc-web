import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { siteConfig } from "@/lib/site";
import { stripHashtags } from "@/lib/strip-hashtags";
import { YouTubeEmbed } from "@/components/youtube-embed";
import { formatDuration } from "@/components/video-card";
import { CourtyardVideo, SeriesCards } from "@/components/courtyard/cards";
import { ReadingShell } from "@/components/courtyard/reading-shell";
import { VideoDescription } from "@/components/video-description";

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
    <ReadingShell className="watch-page">
      <nav className="watch-breadcrumb" aria-label="Breadcrumb">
        <span>
          <Link href="/videos">Library</Link>
          <span aria-hidden="true">/</span>Watch
        </span>
        <Link href="/videos">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to library
        </Link>
      </nav>
      <div className="watch-layout">
        <article className="watch-main">
          <YouTubeEmbed youtubeId={video.youtubeId} title={video.title} />
          <h1>{stripHashtags(video.title)}</h1>
          <p className="watch-meta">
            <time dateTime={new Date(video.publishedAt).toISOString()}>
              {publishedDate}
            </time>
            {video.durationSeconds > 0 && (
              <> · {formatDuration(video.durationSeconds)}</>
            )}
          </p>
          <section
            className="watch-description"
            aria-label="Lesson information"
          >
            {video.description && <h2 id="about-lesson">About this lesson</h2>}
            <VideoDescription description={video.description} />
            <a
              className="courtyard-text-link"
              href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ArrowUpRight size={17} aria-hidden="true" />
              Watch on YouTube
            </a>
          </section>
        </article>
        <aside className="watch-sidebar" aria-label="More to explore">
          {relatedVideos.length > 0 && (
            <section aria-labelledby="related-title">
              <h2 id="related-title">
                {primarySeries
                  ? `More from ${primarySeries.title}`
                  : "More lessons"}
              </h2>
              <div className="watch-related">
                {relatedVideos.slice(0, 3).map((v) => (
                  <CourtyardVideo video={v} compact key={v._id} />
                ))}
              </div>
            </section>
          )}
          {series.length > 0 && (
            <section aria-labelledby="watch-series-title">
              <h2 id="watch-series-title">Series</h2>
              <SeriesCards series={series} />
            </section>
          )}
        </aside>
      </div>
    </ReadingShell>
  );
}
