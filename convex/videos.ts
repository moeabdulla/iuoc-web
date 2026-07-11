import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { query } from "./_generated/server";

export const latest = query({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("videos")
      .withIndex("by_publishedAt")
      .order("desc")
      .take(Math.min(args.limit, 50));
  },
});

export const featured = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db
      .query("videos")
      .withIndex("by_publishedAt")
      .order("desc")
      .collect();
    return all.filter((video) => video.featured).slice(0, 6);
  },
});

export const bySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("videos")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const byPlaylist = query({
  args: { playlistYoutubeId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("videos")
      .withIndex("by_publishedAt")
      .order("desc")
      .collect();
    const matching = all.filter((video) =>
      video.playlistIds.includes(args.playlistYoutubeId),
    );
    return matching.slice(0, args.limit ?? 100);
  },
});

export const search = query({
  args: { query: v.string(), tag: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("videos")
      .withSearchIndex("by_searchText", (q) =>
        q.search("searchText", args.query),
      )
      .take(100);
    const filtered = args.tag
      ? results.filter((video) => video.tags.includes(args.tag!))
      : results;
    return filtered.slice(0, 30);
  },
});

export const paginate = query({
  args: { paginationOpts: paginationOptsValidator, tag: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const page = await ctx.db
      .query("videos")
      .withIndex("by_publishedAt")
      .order("desc")
      .paginate(args.paginationOpts);
    if (!args.tag) return page;
    return {
      ...page,
      page: page.page.filter((video) => video.tags.includes(args.tag!)),
    };
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
