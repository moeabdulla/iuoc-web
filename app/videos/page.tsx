import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { SectionHeading } from "@/components/section-heading";
import { SeriesSection } from "@/components/series-section";
import { VideoExplorer } from "@/components/video-explorer";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Videos" };

export default async function VideosPage() {
  const [playlists, initialVideos, tags] = await Promise.all([
    fetchQuery(api.playlists.listVisible, {}),
    fetchQuery(api.videos.latest, { limit: 24 }),
    fetchQuery(api.videos.allTags, {}),
  ]);

  const seriesWithVideos = await Promise.all(
    playlists.map(async (playlist) => ({
      playlist,
      videos: await fetchQuery(api.videos.byPlaylist, {
        playlistYoutubeId: playlist.youtubeId,
        limit: 10,
      }),
    })),
  );

  const visibleSeries = seriesWithVideos.filter(
    ({ videos }) => videos.length > 0,
  );

  return (
    <div className="container space-y-20 pb-24 pt-14 md:space-y-28 md:pt-20">
      <header className="max-w-2xl">
        <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          <span aria-hidden className="h-px w-6 bg-primary/60" />
          The library
        </p>
        <h1 className="font-serif text-4xl leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
          Every video, in one place.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          Browse the full catalogue by series, or search and filter your way to
          exactly what you want to learn next.
        </p>
      </header>

      {visibleSeries.length > 0 && (
        <section aria-label="Series" className="space-y-14 md:space-y-16">
          <SectionHeading eyebrow="Curated paths" title="Browse by series" />
          {visibleSeries.map(({ playlist, videos }) => (
            <SeriesSection
              key={playlist.youtubeId}
              playlist={playlist}
              videos={videos}
            />
          ))}
        </section>
      )}

      <section aria-label="All videos">
        <SectionHeading eyebrow="The full catalogue" title="All videos" />
        <VideoExplorer initialVideos={initialVideos} tags={tags} />
      </section>
    </div>
  );
}
