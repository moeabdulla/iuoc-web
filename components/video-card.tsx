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
