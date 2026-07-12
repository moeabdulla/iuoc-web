"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { VideoCard } from "@/components/video-card";

const PAGE_SIZE = 24;

export function SeriesGrid({
  playlistYoutubeId,
  initialVideos,
  total,
}: {
  playlistYoutubeId: string;
  initialVideos: Doc<"videos">[];
  total: number;
}) {
  const [videos, setVideos] = useState<Doc<"videos">[]>(initialVideos);
  const [loadingOffset, setLoadingOffset] = useState<number | null>(null);

  const page = useQuery(
    api.videos.byPlaylistPage,
    loadingOffset !== null
      ? { playlistYoutubeId, offset: loadingOffset, limit: PAGE_SIZE }
      : "skip",
  );

  // Merge a fetched page during render (React's documented pattern for
  // deriving state from an async source without an effect).
  if (loadingOffset !== null && page !== undefined) {
    setLoadingOffset(null);
    setVideos((prev) => {
      const seen = new Set(prev.map((video) => video._id));
      return [...prev, ...page.videos.filter((video) => !seen.has(video._id))];
    });
  }

  const loading = loadingOffset !== null;
  const hasMore = videos.length < total;

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setLoadingOffset(videos.length);
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, videos.length]);

  return (
    <>
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
        {loading &&
          Array.from({ length: 4 }).map((_, index) => (
            <div key={`skeleton-${index}`} aria-hidden className="animate-pulse">
              <div className="aspect-video rounded-lg bg-muted" />
              <div className="mt-3 h-4 w-4/5 rounded bg-muted" />
              <div className="mt-2 h-3 w-1/3 rounded bg-muted" />
            </div>
          ))}
      </div>
      {hasMore && <div ref={sentinelRef} aria-hidden className="h-px w-full" />}
    </>
  );
}
