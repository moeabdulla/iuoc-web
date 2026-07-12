import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
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
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-1.5 flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-primary">
            <span aria-hidden className="h-px w-5 bg-primary/60" />
            Series
          </p>
          <h3 className="truncate font-serif text-xl leading-tight tracking-tight md:text-2xl">
            <Link href={href} className="transition-colors hover:text-primary">
              {playlist.title}
            </Link>
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="whitespace-nowrap rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            {count} video{count === 1 ? "" : "s"}
          </span>
          <Link
            href={href}
            aria-label={`View all videos in ${playlist.title}`}
            className="group inline-flex items-center gap-1 text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
          >
            <span className="hidden sm:inline">View all</span>
            <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
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
