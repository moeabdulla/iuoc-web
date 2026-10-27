"use client";
import { useDeferredValue } from "react";
import { usePaginatedQuery, useQuery } from "convex/react";
import { Search, X, Grid2X2, Layers, ArrowRight, Tag } from "lucide-react";
import { useLibraryState } from "@/lib/courtyard/use-library-state";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { CourtyardVideo, SeriesCards } from "@/components/courtyard/cards";

export function VideoExplorer({
  initialVideos,
  tags,
  series,
  initialView = "lessons",
}: {
  initialVideos: Doc<"videos">[];
  tags: string[];
  series: Doc<"playlists">[];
  initialView?: "lessons" | "series";
}) {
  const { state, update } = useLibraryState(initialView);
  const { search: searchInput, view, tag: activeTag } = state;
  const setSearchInput = (search: string) => update({ search });
  const setView = (view: "lessons" | "series") => update({ view });
  const setActiveTag = (tag: string | undefined) => update({ tag });
  const deferredSearch = useDeferredValue(searchInput.trim());
  const searching = deferredSearch.length > 1 && view === "lessons";
  const tagFiltering =
    !searching && activeTag !== undefined && view === "lessons";
  const searchResults = useQuery(
    api.videos.search,
    searching ? { query: deferredSearch, tag: activeTag } : "skip",
  );
  const tagResults = useQuery(
    api.videos.byTag,
    tagFiltering ? { tag: activeTag! } : "skip",
  );
  const paginated = usePaginatedQuery(
    api.videos.paginate,
    searching || tagFiltering || view === "series" ? "skip" : {},
    { initialNumItems: 9 },
  );
  const videos = searching
    ? (searchResults ?? [])
    : tagFiltering
      ? (tagResults ?? [])
      : paginated.results.length > 0
        ? paginated.results
        : initialVideos;
  const pending =
    (searching && searchResults === undefined) ||
    (tagFiltering && tagResults === undefined);
  const visibleSeries = series.filter((s) =>
    s.title.toLowerCase().includes(deferredSearch.toLowerCase()),
  );
  const empty =
    !pending &&
    (view === "series" ? visibleSeries.length === 0 : videos.length === 0);
  const reset = () => {
    update({ search: "", tag: undefined });
  };
  return (
    <div className="library-explorer">
      <label className="library-search">
        <Search size={19} aria-hidden="true" />
        <input
          type="search"
          aria-label="Search lessons or series"
          placeholder={view === "series" ? "Search series" : "Search lessons"}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        {searchInput && (
          <button aria-label="Clear search" onClick={() => setSearchInput("")}>
            <X size={18} />
          </button>
        )}
      </label>
      <div className="library-filters" role="group" aria-label="Browse library">
        <button
          aria-pressed={view === "lessons"}
          onClick={() => setView("lessons")}
        >
          <Grid2X2 size={17} />
          All lessons
        </button>
        <button
          aria-pressed={view === "series"}
          onClick={() => setView("series")}
        >
          <Layers size={17} />
          Series
        </button>
        {tags.length > 0 && view === "lessons" && (
          <label className="library-topics">
            <Tag size={16} />
            <select
              aria-label="Filter by topic"
              value={activeTag ?? ""}
              onChange={(e) => setActiveTag(e.target.value || undefined)}
            >
              <option value="">All topics</option>
              {tags.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
        )}
      </div>
      <div className="library-results" aria-busy={pending}>
        {pending ? (
          <>
            <p role="status" className="library-status">
              Searching the library…
            </p>
            <div
              className="courtyard-lesson-grid library-skeleton"
              aria-hidden="true"
            >
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} />
              ))}
            </div>
          </>
        ) : empty ? (
          <div className="library-empty" role="status">
            <div className="library-empty-icon">
              <Search size={35} strokeWidth={1} />
            </div>
            <h2>No matching {view === "series" ? "series" : "lessons"}</h2>
            <p>
              Try a different search term or browse{" "}
              {view === "series" ? "all series" : "all lessons"}.
            </p>
            <button className="courtyard-outline-button" onClick={reset}>
              View all {view === "series" ? "series" : "lessons"}
              <ArrowRight size={17} />
            </button>
          </div>
        ) : (
          <>
            <h2 className="library-results-heading">
              {view === "series"
                ? "Series"
                : searching
                  ? "Search results"
                  : activeTag
                    ? activeTag
                    : "Latest lessons"}
            </h2>
            {view === "series" ? (
              <SeriesCards series={visibleSeries} />
            ) : (
              <div className="courtyard-lesson-grid">
                {videos.map((v) => (
                  <CourtyardVideo video={v} key={v._id} />
                ))}
              </div>
            )}
            {view === "lessons" &&
              !searching &&
              !tagFiltering &&
              ["CanLoadMore", "LoadingMore"].includes(paginated.status) && (
                <div className="library-load-more">
                  <button
                    className="courtyard-outline-button"
                    disabled={paginated.status === "LoadingMore"}
                    onClick={() => paginated.loadMore(9)}
                  >
                    {paginated.status === "LoadingMore"
                      ? "Loading…"
                      : "Load more"}
                    <ArrowRight size={17} />
                  </button>
                </div>
              )}
            {view === "lessons" &&
              !searching &&
              !tagFiltering &&
              series.length > 0 && (
                <section className="library-series-preview">
                  <div className="courtyard-row-heading">
                    <h2>Series</h2>
                    <button
                      className="courtyard-text-link"
                      onClick={() => {
                        update({ view: "series", search: "", tag: undefined });
                      }}
                    >
                      View all series
                      <ArrowRight size={17} />
                    </button>
                  </div>
                  <SeriesCards series={series.slice(0, 3)} />
                </section>
              )}
          </>
        )}
      </div>
    </div>
  );
}
