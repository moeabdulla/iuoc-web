"use client";

import { useState, useDeferredValue } from "react";
import { usePaginatedQuery, useQuery } from "convex/react";
import { Search, X } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { VideoCard } from "@/components/video-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

export function VideoExplorer({
  initialVideos,
  tags,
}: {
  initialVideos: Doc<"videos">[];
  tags: string[];
}) {
  const [searchInput, setSearchInput] = useState("");
  const [activeTag, setActiveTag] = useState<string | undefined>(undefined);
  const deferredSearch = useDeferredValue(searchInput.trim());

  const searching = deferredSearch.length > 1;
  const tagFiltering = !searching && activeTag !== undefined;

  const searchResults = useQuery(
    api.videos.search,
    searching ? { query: deferredSearch, tag: activeTag } : "skip",
  );
  const tagResults = useQuery(
    api.videos.byTag,
    tagFiltering ? { tag: activeTag } : "skip",
  );
  const paginated = usePaginatedQuery(
    api.videos.paginate,
    searching || tagFiltering ? "skip" : {},
    { initialNumItems: 24 },
  );

  const gridVideos = searching
    ? (searchResults ?? [])
    : tagFiltering
      ? (tagResults ?? [])
      : paginated.results.length > 0
        ? paginated.results
        : initialVideos;

  const searchPending = searching && searchResults === undefined;
  const noSearchMatches = searching && searchResults?.length === 0;
  const dbEmpty = !searching && gridVideos.length === 0;
  const canLoadMore =
    !searching && !tagFiltering && paginated.status === "CanLoadMore";
  const loadingMore = paginated.status === "LoadingMore";

  return (
    <div>
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search videos…"
            aria-label="Search videos"
            className="h-11 rounded-full border-border/70 bg-card/60 pl-9 pr-9 text-sm shadow-sm [&::-webkit-search-cancel-button]:hidden"
          />
          {searchInput.length > 0 && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <FilterChip
              active={activeTag === undefined}
              onClick={() => setActiveTag(undefined)}
            >
              All
            </FilterChip>
            {tags.map((tag) => (
              <FilterChip
                key={tag}
                active={activeTag === tag}
                onClick={() =>
                  setActiveTag((current) => (current === tag ? undefined : tag))
                }
              >
                {tag}
              </FilterChip>
            ))}
          </div>
        )}
      </div>

      {searchPending ? (
        <VideoGridSkeleton />
      ) : noSearchMatches ? (
        <EmptyState
          title="No videos match your search"
          body={`Nothing came up for “${deferredSearch}”. Try a different term or clear the search to browse everything.`}
          action={
            <Button
              variant="outline"
              onClick={() => setSearchInput("")}
              className="mt-6"
            >
              Clear search
            </Button>
          }
        />
      ) : dbEmpty ? (
        <EmptyState
          title="Content is on its way"
          body="New videos are being prepared. Follow along on YouTube to be the first to watch."
          action={
            <Button asChild variant="outline" className="mt-6">
              <a
                href={siteConfig.links.youtube}
                target="_blank"
                rel="noreferrer"
              >
                Visit the channel
              </a>
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {gridVideos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>

          {canLoadMore && (
            <div className="mt-14 flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => paginated.loadMore(24)}
                disabled={loadingMore}
                className="h-12 min-w-44 gap-2 px-8"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors " +
        (active
          ? "border-transparent bg-primary text-primary-foreground shadow-sm"
          : "border-border/70 bg-card/60 text-muted-foreground hover:border-primary/50 hover:text-foreground")
      }
    >
      {children}
    </button>
  );
}

function VideoGridSkeleton() {
  return (
    <div
      aria-hidden
      className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-video rounded-lg bg-muted" />
          <div className="mt-3 h-4 w-4/5 rounded bg-muted" />
          <div className="mt-2 h-3 w-1/3 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/30 px-6 py-20 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Search className="size-5" aria-hidden />
      </span>
      <h3 className="font-serif text-2xl tracking-tight">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{body}</p>
      {action}
    </div>
  );
}
