import { describe, expect, it } from "vitest";
import {
  buildSearchText,
  chunk,
  makeSlug,
  mergeVideo,
  parseIso8601Duration,
  type MergeableVideo,
} from "./youtube";

describe("parseIso8601Duration", () => {
  it("parses hours, minutes, seconds", () => {
    expect(parseIso8601Duration("PT1H2M3S")).toBe(3723);
  });
  it("parses minutes-only and seconds-only", () => {
    expect(parseIso8601Duration("PT4M")).toBe(240);
    expect(parseIso8601Duration("PT58S")).toBe(58);
  });
  it("returns 0 for invalid input", () => {
    expect(parseIso8601Duration("")).toBe(0);
    expect(parseIso8601Duration("garbage")).toBe(0);
  });
});

describe("makeSlug", () => {
  it("kebab-cases the title and appends a stable id suffix", () => {
    // suffix: "abcDEF12_-Xy" -> strip non-alphanumerics, lowercase -> "abcdef12xy" -> last 4 = "12xy"
    expect(makeSlug("The Seerah: Part 1!", "abcDEF12_-Xy")).toBe(
      "the-seerah-part-1-12xy",
    );
  });
  it("never returns an empty slug for symbol-only titles", () => {
    const slug = makeSlug("***", "abcDEF12_-Xy");
    expect(slug.length).toBeGreaterThan(0);
    expect(slug).toMatch(/^video-/);
  });
});

describe("buildSearchText", () => {
  it("joins title and description", () => {
    expect(buildSearchText("A", "B")).toBe("A\nB");
  });
});

describe("mergeVideo", () => {
  const existing: MergeableVideo = {
    youtubeId: "id1",
    slug: "old-slug",
    title: "Old",
    description: "old",
    publishedAt: 1,
    thumbnail: "old.jpg",
    durationSeconds: 10,
    playlistIds: ["p1"],
    tags: ["psychology"],
    featured: true,
    searchText: "Old\nold",
  };
  const incoming: MergeableVideo = {
    youtubeId: "id1",
    slug: "new-slug",
    title: "New",
    description: "new",
    publishedAt: 2,
    thumbnail: "new.jpg",
    durationSeconds: 20,
    playlistIds: ["p2"],
    tags: [],
    featured: false,
    searchText: "New\nnew",
  };
  it("takes YouTube-derived fields from incoming", () => {
    const merged = mergeVideo(existing, incoming);
    expect(merged.title).toBe("New");
    expect(merged.publishedAt).toBe(2);
    expect(merged.playlistIds).toEqual(["p2"]);
    expect(merged.searchText).toBe("New\nnew");
  });
  it("preserves manual fields and slug from existing", () => {
    const merged = mergeVideo(existing, incoming);
    expect(merged.tags).toEqual(["psychology"]);
    expect(merged.featured).toBe(true);
    expect(merged.slug).toBe("old-slug");
  });

  it("takes incoming.isShort when it is defined", () => {
    const merged = mergeVideo(
      { ...existing, isShort: false },
      { ...incoming, isShort: true },
    );
    expect(merged.isShort).toBe(true);
  });

  it("preserves existing.isShort when incoming.isShort is undefined", () => {
    const merged = mergeVideo(
      { ...existing, isShort: true },
      { ...incoming, isShort: undefined },
    );
    expect(merged.isShort).toBe(true);
  });

  it("leaves isShort undefined when both existing and incoming are undefined", () => {
    const merged = mergeVideo(
      { ...existing, isShort: undefined },
      { ...incoming, isShort: undefined },
    );
    expect(merged.isShort).toBeUndefined();
  });
});

describe("chunk", () => {
  it("splits into fixed-size groups", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
});
