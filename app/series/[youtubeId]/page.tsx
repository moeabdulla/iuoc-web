import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { ArrowLeft, Sparkles } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { siteConfig } from "@/lib/site";
import { SeriesGrid } from "@/components/series-grid";
import { Button } from "@/components/ui/button";

export const revalidate = 3600;

type Props = { params: Promise<{ youtubeId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { youtubeId } = await params;
  const playlist = await fetchQuery(api.playlists.byYoutubeId, { youtubeId });
  if (!playlist) return {};
  const description = playlist.description.slice(0, 160);
  return {
    title: playlist.title,
    description,
    alternates: { canonical: `${siteConfig.url}/series/${playlist.youtubeId}` },
    openGraph: {
      title: playlist.title,
      description,
      images: [{ url: playlist.thumbnail }],
      type: "website",
    },
  };
}

export default async function SeriesPage({ params }: Props) {
  const { youtubeId } = await params;
  const playlist = await fetchQuery(api.playlists.byYoutubeId, { youtubeId });
  if (!playlist) notFound();

  const { videos, total } = await fetchQuery(api.videos.byPlaylistPage, {
    playlistYoutubeId: playlist.youtubeId,
    offset: 0,
    limit: 24,
  });

  return (
    <div className="container pb-24 pt-14 md:pt-20">
      <Link
        href="/videos"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary md:mb-10"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to videos
      </Link>

      <header className="max-w-2xl border-b border-border/60 pb-8 md:pb-10">
        <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          <span aria-hidden className="h-px w-6 bg-primary/60" />
          Series
        </p>
        <h1 className="font-serif text-4xl leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
          {playlist.title}
        </h1>
        {playlist.description && (
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            {playlist.description}
          </p>
        )}
        <p className="mt-6 text-sm font-medium text-muted-foreground">
          {total} video{total === 1 ? "" : "s"}
        </p>
      </header>

      <div className="mt-12 md:mt-16">
        {total === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/30 px-6 py-20 text-center">
            <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <h2 className="font-serif text-2xl tracking-tight">
              No videos yet
            </h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              This series is being prepared. Follow along on YouTube to be the
              first to watch.
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
        ) : (
          <SeriesGrid
            playlistYoutubeId={playlist.youtubeId}
            initialVideos={videos}
            total={total}
          />
        )}
      </div>
    </div>
  );
}
