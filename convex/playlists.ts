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
