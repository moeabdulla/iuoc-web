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
      <header className="mx-auto max-w-2xl border-b border-border pb-10 text-center md:pb-12">
        <div aria-hidden className="text-sm tracking-[0.6em] text-gold">
          &#10022; &#10022; &#10022;
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-gold">
          The Library
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-[1.1] md:text-5xl">
          Every lecture, gathered in one volume.
        </h1>
        <p className="mx-auto mt-5 max-w-lg font-serif text-lg italic leading-relaxed text-muted-foreground">
          Browse the full catalogue by series, or search the shelves for exactly
          what you wish to learn next.
        </p>
      </header>

      {visibleSeries.length > 0 && (
        <section aria-label="Series" className="space-y-14 md:space-y-16">
          <SectionHeading eyebrow="Chapter I" title="The Series" />
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
        <SectionHeading eyebrow="Chapter II" title="The Full Catalogue" />
        <VideoExplorer initialVideos={initialVideos} tags={tags} />
      </section>
    </div>
  );
}
