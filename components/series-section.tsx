import type { Doc } from "@/convex/_generated/dataModel";
import { VideoCard } from "@/components/video-card";

export function SeriesSection({
  playlist,
  videos,
}: {
  playlist: Doc<"playlists">;
  videos: Doc<"videos">[];
}) {
  const count = playlist.itemCount > 0 ? playlist.itemCount : videos.length;

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
            {playlist.title}
          </h3>
        </div>
        <span className="shrink-0 whitespace-nowrap rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          {count} video{count === 1 ? "" : "s"}
        </span>
      </div>

      <div className="relative">
        <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-4 px-4 pb-4 [scrollbar-width:thin] md:-mx-6 md:scroll-pl-6 md:px-6">
          {videos.map((video) => (
            <li
              key={video._id}
              className="w-60 shrink-0 snap-start sm:w-64 md:w-72"
            >
              <VideoCard video={video} />
            </li>
          ))}
        </ul>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-12 bg-gradient-to-l from-background to-transparent md:block"
        />
      </div>
    </section>
  );
}
