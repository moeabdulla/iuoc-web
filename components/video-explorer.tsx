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
  const tagPending = tagFiltering && tagResults === undefined;
  const noSearchMatches = searching && searchResults?.length === 0;
  const dbEmpty = !searching && !tagPending && gridVideos.length === 0;
  const canLoadMore =
    !searching && !tagFiltering && paginated.status === "CanLoadMore";
  const loadingMore = paginated.status === "LoadingMore";

  return (
    <div>
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <label className="relative w-full md:max-w-sm">
          <span className="mb-2 block text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-gold">
            Search the shelves
          </span>
          <Search
            aria-hidden
            className="pointer-events-none absolute bottom-2.5 left-3 size-4 text-muted-foreground"
          />
          <Input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="By title or subject…"
            aria-label="Search videos"
            className="h-11 rounded-none border-x-0 border-t-0 border-b border-border bg-transparent px-9 text-sm shadow-none focus-visible:ring-0 focus-visible:border-primary [&::-webkit-search-cancel-button]:hidden"
          />
          {searchInput.length > 0 && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              aria-label="Clear search"
              className="absolute bottom-2 right-2 flex size-6 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </label>

        {tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
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

      {searchPending || tagPending ? (
        <VideoGridSkeleton />
      ) : noSearchMatches ? (
        <EmptyState
          title="No videos match your search"
          body={`Nothing came up for “${deferredSearch}”. Try a different term or clear the search to browse everything.`}
          action={
            <Button
              variant="outline"
              onClick={() => setSearchInput("")}
              className="mt-6 rounded-none border-primary bg-transparent text-primary shadow-none hover:bg-primary/10 hover:text-primary"
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
            <Button
              asChild
              variant="outline"
              className="mt-6 rounded-none border-primary bg-transparent text-primary shadow-none hover:bg-primary/10 hover:text-primary"
            >
              <a
                href={siteConfig.links.youtube}
                target="_blank"
                rel="noopener noreferrer"
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
              <button
                type="button"
                onClick={() => paginated.loadMore(24)}
                disabled={loadingMore}
                className="font-serif text-base italic text-primary underline-offset-4 transition-colors hover:underline disabled:opacity-60"
              >
                {loadingMore ? "Loading…" : "— view more —"}
              </button>
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
        "border-b pb-0.5 text-xs uppercase tracking-[0.2em] transition-colors " +
        (active
          ? "border-gold text-gold"
          : "border-transparent text-muted-foreground hover:text-foreground")
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
          <div className="border border-border bg-secondary p-1.5">
            <div className="aspect-video border border-border/60 bg-muted" />
          </div>
          <div className="mx-auto mt-3 h-3 w-1/3 bg-muted" />
          <div className="mx-auto mt-2 h-4 w-4/5 bg-muted" />
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
    <div className="mx-auto flex max-w-xl flex-col items-center border border-border bg-secondary/50 px-6 py-20 text-center">
      <span aria-hidden className="text-sm tracking-[0.5em] text-gold">
        &#10022;
      </span>
      <h3 className="mt-4 font-serif text-2xl">{title}</h3>
      <p className="mt-2 max-w-sm text-sm italic text-muted-foreground">
        {body}
      </p>
      {action}
    </div>
  );
}
