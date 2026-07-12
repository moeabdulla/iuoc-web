import Image from "next/image";
import Link from "next/link";
import type { Doc } from "@/convex/_generated/dataModel";
import { stripHashtags } from "@/lib/strip-hashtags";

export { stripHashtags };

export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`;
}

export function VideoCard({ video }: { video: Doc<"videos"> }) {
  // Shorts get YouTube's letterboxed 16:9 auto-thumbnail (blurred bars around
  // a vertical frame), which reads poorly in a horizontal grid cell. Instead
  // of showing that, anchor the vertical frame to the right and let a
  // horizontal gradient fade it into a deep neutral background on the left,
  // where the (hashtag-free) title sits as large display serif.
  if (video.isShort) {
    const displayTitle = stripHashtags(video.title);
    return (
      <Link href={`/videos/${video.slug}`} className="group block">
        <div className="relative aspect-video overflow-hidden rounded-lg bg-foreground dark:bg-background">
          <div className="absolute inset-y-0 right-0 w-[55%] overflow-hidden">
            <Image
              src={video.thumbnail}
              alt={video.title}
              fill
              sizes="(max-width: 640px) 55vw, (max-width: 1024px) 28vw, 14vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
          <div
            aria-hidden
            className="absolute inset-y-0 left-0 w-[80%] bg-gradient-to-r from-foreground via-foreground/90 to-transparent dark:from-background dark:via-background/90"
          />
          <div className="relative flex h-full w-[70%] flex-col justify-between gap-2 p-2.5 sm:p-3.5">
            <p className="flex items-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-background/70 dark:text-foreground/70">
              <span aria-hidden className="h-px w-4 bg-background/50 dark:bg-foreground/50" />
              Short
            </p>
            <h3 className="line-clamp-4 font-serif text-lg font-semibold leading-[1.1] text-background dark:text-foreground sm:text-xl">
              {displayTitle}
            </h3>
            {video.durationSeconds > 0 && (
              <span className="inline-flex w-fit items-center rounded bg-background/15 px-1.5 py-0.5 text-[0.6rem] font-medium text-background dark:bg-foreground/15 dark:text-foreground sm:text-[0.65rem]">
                {formatDuration(video.durationSeconds)}
              </span>
            )}
          </div>
        </div>
        <p className="text-muted-foreground mt-2 text-sm">
          {new Date(video.publishedAt).toLocaleDateString("en-CA", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </Link>
    );
  }

  return (
    <Link href={`/videos/${video.slug}`} className="group block">
      <div className="relative aspect-video overflow-hidden rounded-lg">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform group-hover:scale-105"
        />
        {video.durationSeconds > 0 && (
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white">
            {formatDuration(video.durationSeconds)}
          </span>
        )}
      </div>
      <h3 className="mt-2 line-clamp-2 font-medium leading-snug">
        {video.title}
      </h3>
      <p className="text-muted-foreground mt-1 text-sm">
        {new Date(video.publishedAt).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </p>
    </Link>
  );
}
