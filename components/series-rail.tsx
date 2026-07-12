"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { VideoCard } from "@/components/video-card";

const PAGE_SIZE = 10;

export function SeriesRail({
  playlistYoutubeId,
  initialVideos,
}: {
  playlistYoutubeId: string;
  initialVideos: Doc<"videos">[];
}) {
  const [videos, setVideos] = useState<Doc<"videos">[]>(initialVideos);
  const [total, setTotal] = useState<number | null>(
    initialVideos.length < PAGE_SIZE ? initialVideos.length : null,
  );
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
    setTotal(page.total);
    setVideos((prev) => {
      const seen = new Set(prev.map((video) => video._id));
      return [...prev, ...page.videos.filter((video) => !seen.has(video._id))];
    });
  }

  const loading = loadingOffset !== null;
  const hasMore = total === null || videos.length < total;

  const railRef = useRef<HTMLUListElement>(null);
  const sentinelRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const rail = railRef.current;
    const sentinel = sentinelRef.current;
    if (!rail || !sentinel || !hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setLoadingOffset(videos.length);
      },
      { root: rail, rootMargin: "0px 250px 0px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, videos.length]);

  return (
    <div className="relative">
      <ul
        ref={railRef}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-4 px-4 pb-4 [scrollbar-width:thin] md:-mx-6 md:scroll-pl-6 md:px-6"
      >
        {videos.map((video) => (
          <li
            key={video._id}
            className="w-60 shrink-0 snap-start sm:w-64 md:w-72"
          >
            <VideoCard video={video} />
          </li>
        ))}
        {loading && (
          <li aria-hidden className="w-60 shrink-0 snap-start sm:w-64 md:w-72">
            <div className="animate-pulse">
              <div className="aspect-video rounded-lg bg-muted" />
              <div className="mt-2 h-4 w-4/5 rounded bg-muted" />
              <div className="mt-1 h-3 w-1/3 rounded bg-muted" />
            </div>
          </li>
        )}
        {hasMore && (
          <li ref={sentinelRef} aria-hidden className="w-px shrink-0" />
        )}
      </ul>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-12 bg-gradient-to-l from-background to-transparent md:block"
      />
    </div>
  );
}
