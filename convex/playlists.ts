import { v } from "convex/values";
import { query } from "./_generated/server";

export const listVisible = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("playlists").collect();
    return all
      .filter((playlist) => playlist.visible)
      .sort(
        (a, b) =>
          (a.displayOrder ?? 999) - (b.displayOrder ?? 999) ||
          a.title.localeCompare(b.title),
      );
  },
});

export const byYoutubeId = query({
  args: { youtubeId: v.string() },
  handler: async (ctx, args) => {
    const playlist = await ctx.db
      .query("playlists")
      .withIndex("by_youtubeId", (q) => q.eq("youtubeId", args.youtubeId))
      .unique();
    return playlist !== null && playlist.visible ? playlist : null;
  },
});
