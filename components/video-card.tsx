import Image from "next/image";
import Link from "next/link";
import type { Doc } from "@/convex/_generated/dataModel";

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
  // of showing that, split the cell: a title panel on the left, the vertical
  // frame center-cropped on the right.
  if (video.isShort) {
    return (
      <Link href={`/videos/${video.slug}`} className="group block">
        <div className="relative flex aspect-video overflow-hidden rounded-lg">
          <div className="flex w-[58%] flex-col justify-between gap-2 bg-primary p-2.5 text-primary-foreground sm:p-3">
            <p className="flex items-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-primary-foreground/75">
              <span aria-hidden className="h-px w-4 bg-primary-foreground/50" />
              Short
            </p>
            <h3 className="line-clamp-3 font-serif text-xs font-semibold leading-snug text-primary-foreground sm:text-sm">
              {video.title}
            </h3>
            {video.durationSeconds > 0 && (
              <span className="inline-flex w-fit items-center rounded bg-primary-foreground/15 px-1.5 py-0.5 text-[0.6rem] font-medium text-primary-foreground sm:text-[0.65rem]">
                {formatDuration(video.durationSeconds)}
              </span>
            )}
          </div>
          <div className="relative w-[42%] shrink-0 overflow-hidden">
            <Image
              src={video.thumbnail}
              alt={video.title}
              fill
              sizes="(max-width: 640px) 42vw, (max-width: 1024px) 21vw, 11vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
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
