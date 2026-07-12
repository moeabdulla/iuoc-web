import Link from "next/link";
import type { Doc } from "@/convex/_generated/dataModel";
import { SeriesRail } from "@/components/series-rail";

export function SeriesSection({
  playlist,
  videos,
}: {
  playlist: Doc<"playlists">;
  videos: Doc<"videos">[];
}) {
  const count = playlist.itemCount > 0 ? playlist.itemCount : videos.length;
  const href = `/series/${playlist.youtubeId}`;

  return (
    <section
      id={`series-${playlist.youtubeId}`}
      aria-label={playlist.title}
      className="scroll-mt-24"
    >
      <div className="mb-5 flex items-end justify-between gap-4 border-b border-border pb-3">
        <div className="min-w-0">
          <p className="mb-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-gold">
            Series
          </p>
          <h3 className="truncate font-serif text-xl leading-tight md:text-2xl">
            <Link href={href} className="transition-colors hover:text-primary">
              {playlist.title}
            </Link>
          </h3>
        </div>
        <div className="flex shrink-0 items-baseline gap-4">
          <span className="whitespace-nowrap font-serif text-sm italic text-muted-foreground">
            {count} lecture{count === 1 ? "" : "s"}
          </span>
          <Link
            href={href}
            aria-label={`View all videos in ${playlist.title}`}
            className="whitespace-nowrap font-serif text-sm italic text-primary underline-offset-4 transition-colors hover:underline"
          >
            View all &rarr;
          </Link>
        </div>
      </div>

      <SeriesRail
        playlistYoutubeId={playlist.youtubeId}
        initialVideos={videos}
      />
    </section>
  );
}
