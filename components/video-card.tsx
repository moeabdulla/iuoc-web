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

function formatDate(publishedAt: number): string {
  return new Date(publishedAt).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type VideoCardProps = {
  video: Doc<"videos">;
  // Small-caps figure label above the title (e.g. "Short"). Defaults to the
  // video's kind. Kept optional so every existing call site works unchanged.
  label?: string;
  // Tightens the caption for dense grids (smaller title, no date).
  compact?: boolean;
};

// A video framed like a figure in a printed book: an ink outer frame with a
// gold hairline inner, and a caption beneath (small-caps label, serif title,
// italic date).
export function VideoCard({ video, label, compact = false }: VideoCardProps) {
  const figureLabel = label ?? (video.isShort ? "Short" : "Lecture");

  const durationChip = video.durationSeconds > 0 && (
    <span className="absolute bottom-1.5 right-1.5 border border-foreground bg-background px-1.5 py-0.5 text-[0.7rem] tabular-nums text-foreground">
      {formatDuration(video.durationSeconds)}
    </span>
  );

  // Shorts get YouTube's letterboxed 16:9 auto-thumbnail (blurred bars around a
  // vertical frame), which reads poorly in a horizontal cell. The vertical
  // frame is anchored right and faded into an ink panel on the left, where the
  // hashtag-free title sits in display serif — restyled to the paper/ink
  // palette so it harmonizes inside the plate frame.
  const media = video.isShort ? (
    <div className="relative aspect-video overflow-hidden bg-foreground text-background dark:bg-[hsl(146_18%_5%)] dark:text-foreground">
      {/* The image container's own left edge is where the panel color must
          continue unbroken, so the fade lives inside it (clipped to the same
          bounds as the thumbnail) rather than as an independently-sized
          sibling — that mismatch was what left a hard seam before. */}
      <div className="absolute inset-y-0 right-0 w-[60%] overflow-hidden">
        {/* object-cover scales the 16:9 source to the container's height, so the
            drawn width is ~the full card width, not the container's 60% — the
            sizes hint must match the drawn width or Next serves a soft variant */}
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          quality={85}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-foreground to-transparent dark:from-[hsl(146_18%_5%)]"
        />
      </div>
      <div className="relative flex h-full w-[68%] flex-col justify-center p-2.5 sm:p-3.5">
        <h3 className="line-clamp-4 font-serif text-lg font-medium leading-[1.15] sm:text-xl">
          {stripHashtags(video.title)}
        </h3>
      </div>
      {durationChip}
    </div>
  ) : (
    <div className="relative aspect-video overflow-hidden">
      <Image
        src={video.thumbnail}
        alt={video.title}
        fill
        quality={85}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="object-cover transition-transform group-hover:scale-105"
      />
      {durationChip}
    </div>
  );

  return (
    <Link href={`/videos/${video.slug}`} className="group block">
      <figure>
        <div className="border border-foreground bg-secondary p-1.5">
          <div className="border border-gold">{media}</div>
        </div>
        <figcaption className="mt-3 text-center">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-accent-red">
            {figureLabel}
          </p>
          {!video.isShort && (
            <h3
              className={
                "mt-1.5 font-serif font-medium leading-snug transition-colors group-hover:text-primary " +
                (compact ? "line-clamp-2 text-sm" : "text-lg")
              }
            >
              {video.title}
            </h3>
          )}
          {!compact && (
            <p className="mt-1.5 font-serif text-sm italic text-muted-foreground">
              {formatDate(video.publishedAt)}
            </p>
          )}
        </figcaption>
      </figure>
    </Link>
  );
}
