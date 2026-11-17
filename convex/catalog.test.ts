// @vitest-environment edge-runtime
/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { afterEach, describe, expect, it, vi } from "vitest";
import { api, internal } from "./_generated/api";
import * as ingestion from "./ingest";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

async function catalogue() {
  const t = convexTest(schema, modules);
  await t.run(async (ctx) => {
    for (let n = 0; n < 72; n++) {
      await ctx.db.insert("videos", {
        youtubeId: `video-${n}`,
        slug: `lesson-${n}`,
        title: `Lesson ${n}`,
        description: "Public lesson description",
        publishedAt: n,
        thumbnail: "https://i.ytimg.com/vi/example/hqdefault.jpg",
        durationSeconds: 60,
        playlistIds: ["series"],
        tags: [n % 2 ? "odd" : "even"],
        featured: n % 10 === 0,
        searchText: `Lesson ${n}`,
      });
    }
    for (const visible of [false, true]) {
      await ctx.db.insert("playlists", {
        youtubeId: visible ? "visible" : "hidden",
        title: visible ? "Visible series" : "Hidden series",
        description: "A series",
        thumbnail: "https://i.ytimg.com/example.jpg",
        itemCount: 0,
        visible,
      });
    }
  });
  return t;
}

afterEach(() => vi.unstubAllGlobals());

describe("public catalogue boundaries", () => {
  it("never registers ingestion or database write helpers as public functions", () => {
    for (const fn of Object.values(ingestion)) {
      expect(fn).toHaveProperty("isInternal", true);
      expect(fn).not.toHaveProperty("isPublic", true);
    }
  });

  it("reads stored results without making YouTube or any other network requests", async () => {
    const t = await catalogue();
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    expect(await t.query(api.videos.latest, { limit: 9 })).toHaveLength(9);
    expect(await t.query(api.videos.featured, {})).toHaveLength(6);
    expect(await t.query(api.playlists.listVisible, {})).toHaveLength(1);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("caps bulk reads and preserves descending catalogue order", async () => {
    const t = await catalogue();
    const latest = await t.query(api.videos.latest, { limit: 1_000_000 });
    expect(latest).toHaveLength(50);
    expect(latest[0].slug).toBe("lesson-71");
    const featured = await t.query(api.videos.featured, {});
    expect(featured.map((v) => v.publishedAt)).toEqual([
      70, 60, 50, 40, 30, 20,
    ]);
    const page = await t.query(api.videos.paginate, {
      paginationOpts: {
        numItems: 1_000_000,
        cursor: null,
        maximumRowsRead: 1_000_000,
      },
    });
    expect(page.page).toHaveLength(48);
    expect(page.isDone).toBe(false);
    const next = await t.query(api.videos.paginate, {
      paginationOpts: { numItems: 48, cursor: page.continueCursor },
    });
    expect(next.page).toHaveLength(24);
  });

  it.each([-1, 0, 1.5, NaN, Infinity])(
    "rejects invalid count %s before reading",
    async (limit) => {
      const t = convexTest(schema, modules);
      await expect(t.query(api.videos.latest, { limit })).rejects.toThrow(
        "whole number",
      );
    },
  );

  it("validates search text and handles empty search without a database search", async () => {
    const t = convexTest(schema, modules);
    expect(await t.query(api.videos.search, { query: "  " })).toEqual([]);
    await expect(
      t.query(api.videos.search, { query: "x".repeat(201) }),
    ).rejects.toThrow("200 characters");
  });

  it("keeps series totals and pagination aligned and rejects invalid offsets", async () => {
    const t = await catalogue();
    const page = await t.query(api.videos.byPlaylistPage, {
      playlistYoutubeId: "series",
      offset: 2,
      limit: 3,
    });
    expect(page.total).toBe(72);
    expect(page.videos.map((v) => v.slug)).toEqual([
      "lesson-69",
      "lesson-68",
      "lesson-67",
    ]);
    await expect(
      t.query(api.videos.byPlaylistPage, {
        playlistYoutubeId: "series",
        offset: NaN,
        limit: 3,
      }),
    ).rejects.toThrow("whole number");
  });

  it("does not expose hidden series through either series lookup", async () => {
    const t = await catalogue();
    expect(
      await t.query(api.playlists.byYoutubeId, { youtubeId: "hidden" }),
    ).toBeNull();
    expect(await t.query(api.playlists.listVisible, {})).toEqual([
      expect.objectContaining({ youtubeId: "visible" }),
    ]);
  });

  it("refuses an empty import deletion set and keeps the existing catalogue", async () => {
    const t = await catalogue();
    await expect(
      t.mutation(internal.ingest.removeStaleVideos, { currentYoutubeIds: [] }),
    ).rejects.toThrow("refusing to delete");
    expect(await t.query(api.videos.latest, { limit: 50 })).toHaveLength(50);
  });
});
