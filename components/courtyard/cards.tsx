import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";
import { formatDuration } from "@/components/video-card";
import { stripHashtags } from "@/lib/strip-hashtags";

export function LessonImage({
  video,
  large = false,
}: {
  video: Doc<"videos">;
  large?: boolean;
}) {
  return (
    <div className="courtyard-video-image">
      <Image
        src={video.thumbnail}
        alt=""
        fill
        sizes={
          large
            ? "(max-width:700px) 90vw, 48vw"
            : "(max-width:700px) 90vw, (max-width:1100px) 40vw, 27vw"
        }
        quality={85}
        draggable={false}
      />
      <span className="courtyard-play">
        <Play size={large ? 25 : 20} fill="currentColor" aria-hidden="true" />
      </span>
      {video.durationSeconds > 0 && (
        <span className="courtyard-duration">
          {formatDuration(video.durationSeconds)}
        </span>
      )}
    </div>
  );
}
export function CourtyardVideo({
  video,
  compact = false,
}: {
  video: Doc<"videos">;
  compact?: boolean;
}) {
  return (
    <Link
      className={`courtyard-video${compact ? " courtyard-video-compact" : ""}`}
      href={`/videos/${video.slug}`}
    >
      <LessonImage video={video} />
      <div className="courtyard-video-caption">
        <h3>{stripHashtags(video.title)}</h3>
        <ArrowRight size={18} aria-hidden="true" />
      </div>
    </Link>
  );
}
export function FeaturedLesson({ video }: { video: Doc<"videos"> }) {
  return (
    <div className="courtyard-featured">
      <Link
        href={`/videos/${video.slug}`}
        aria-label={`Watch ${stripHashtags(video.title)}`}
      >
        <LessonImage video={video} large />
      </Link>
      <div className="courtyard-featured-copy">
        <h3>
          <Link href={`/videos/${video.slug}`}>
            {stripHashtags(video.title)}
          </Link>
        </h3>
        <Link className="courtyard-button" href={`/videos/${video.slug}`}>
          Watch lesson <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
export function SeriesCards({ series }: { series: Doc<"playlists">[] }) {
  return (
    <div className="courtyard-series-grid">
      {series.map((s) => (
        <Link key={s._id} href={`/series/${s.youtubeId}`}>
          <div className="courtyard-series-image">
            <Image
              src={s.thumbnail}
              alt=""
              fill
              sizes="(max-width:700px) 90vw, 27vw"
              quality={85}
              draggable={false}
            />
          </div>
          <span>
            {s.title}
            <ArrowRight size={18} aria-hidden="true" />
          </span>
        </Link>
      ))}
    </div>
  );
}
export function SectionTitle({
  title,
  href,
  linkText = "View all lessons",
  id,
}: {
  title: string;
  href?: string;
  linkText?: string;
  id?: string;
}) {
  return (
    <div className="courtyard-row-heading">
      <h2 id={id}>{title}</h2>
      {href && (
        <Link href={href} className="courtyard-text-link">
          {linkText}
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
