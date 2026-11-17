import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { query } from "./_generated/server";
import { boundedInteger, boundedText } from "./lib/query-limits";

export const latest = query({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("videos")
      .withIndex("by_publishedAt")
      .order("desc")
      .take(boundedInteger(args.limit, 50));
  },
});

export const featured = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("videos")
      .withIndex("by_featured_and_publishedAt", (q) => q.eq("featured", true))
      .order("desc")
      .take(6);
  },
});

export const bySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("videos")
      .withIndex("by_slug", (q) => q.eq("slug", boundedText(args.slug, 160)))
      // Reject unexpected duplicates rather than silently linking the wrong video.
      .unique();
  },
});

export const byPlaylist = query({
  args: { playlistYoutubeId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const playlistId = boundedText(args.playlistYoutubeId, 128);
    const limit = boundedInteger(args.limit ?? 100, 200);
    const videos = [];
    // Stop once the requested matches are found instead of collecting all docs.
    for await (const video of ctx.db
      .query("videos")
      .withIndex("by_publishedAt")
      .order("desc")) {
      if (video.playlistIds.includes(playlistId)) videos.push(video);
      if (videos.length === limit) break;
    }
    return videos;
  },
});

export const byPlaylistPage = query({
  args: {
    playlistYoutubeId: v.string(),
    offset: v.number(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const playlistId = boundedText(args.playlistYoutubeId, 128);
    const limit = boundedInteger(args.limit, 48);
    const offset = boundedInteger(args.offset, Number.MAX_SAFE_INTEGER, 0);
    const all = await ctx.db
      .query("videos")
      .withIndex("by_publishedAt")
      .order("desc")
      .collect();
    const matching = all.filter((video) =>
      video.playlistIds.includes(playlistId),
    );
    return {
      videos: matching.slice(offset, offset + limit),
      total: matching.length,
    };
  },
});

export const search = query({
  args: { query: v.string(), tag: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const text = boundedText(args.query, 200);
    const tag = args.tag === undefined ? undefined : boundedText(args.tag, 100);
    if (!text) return [];
    const results = await ctx.db
      .query("videos")
      .withSearchIndex("by_searchText", (q) => q.search("searchText", text))
      .take(100);
    const filtered = tag
      ? results.filter((video) => video.tags.includes(tag))
      : results;
    return filtered.slice(0, 30);
  },
});

export const paginate = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const options = args.paginationOpts;
    // Preserve the opaque cursors used by usePaginatedQuery, but do not trust
    // client-supplied read budgets or arbitrarily large page requests.
    const numItems = boundedInteger(options.numItems, 48);
    if (options.cursor) boundedText(options.cursor, 4096);
    if (options.endCursor) boundedText(options.endCursor, 4096);
    return await ctx.db
      .query("videos")
      .withIndex("by_publishedAt")
      .order("desc")
      .paginate({
        ...options,
        numItems,
        maximumRowsRead: 200,
        maximumBytesRead: 1_000_000,
      });
  },
});

export const byTag = query({
  args: { tag: v.string() },
  handler: async (ctx, args) => {
    const tag = boundedText(args.tag, 100);
    const videos = [];
    for await (const video of ctx.db
      .query("videos")
      .withIndex("by_publishedAt")
      .order("desc")) {
      if (video.tags.includes(tag)) videos.push(video);
      if (videos.length === 200) break;
    }
    return videos;
  },
});

export const allTags = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("videos").collect();
    const tags = new Set<string>();
    for (const video of all) for (const tag of video.tags) tags.add(tag);
    return [...tags].sort();
  },
});

export const allSlugs = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("videos").collect();
    return all.map((video) => ({
      slug: video.slug,
      publishedAt: video.publishedAt,
    }));
  },
});
