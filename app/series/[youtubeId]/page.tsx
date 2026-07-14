import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { ArrowLeft } from "lucide-react";
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

      <header className="mx-auto max-w-2xl border-b border-border pb-8 text-center md:pb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
          A Series
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-[1.1] md:text-5xl">
          {playlist.title}
        </h1>
        {playlist.description && (
          <p className="mx-auto mt-6 max-w-xl font-serif text-base leading-relaxed text-foreground/80 md:text-lg">
            {playlist.description}
          </p>
        )}
        <p className="mt-6 font-serif text-sm italic text-muted-foreground">
          {total} lecture{total === 1 ? "" : "s"}
        </p>
      </header>

      <div className="mt-12 md:mt-16">
        {total === 0 ? (
          <div className="mx-auto flex max-w-xl flex-col items-center border border-border bg-secondary/50 px-6 py-20 text-center">
            <span aria-hidden className="text-sm tracking-[0.5em] text-gold">
              &#10022;
            </span>
            <h2 className="mt-4 font-serif text-2xl">No lectures yet</h2>
            <p className="mt-2 max-w-sm text-sm italic text-muted-foreground">
              This series is being prepared. Follow along on YouTube to be the
              first to watch.
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
