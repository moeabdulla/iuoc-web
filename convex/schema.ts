import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  videos: defineTable({
    youtubeId: v.string(),
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    publishedAt: v.number(),
    thumbnail: v.string(),
    durationSeconds: v.number(),
    playlistIds: v.array(v.string()),
    tags: v.array(v.string()),
    featured: v.boolean(),
    searchText: v.string(),
  })
    .index("by_youtubeId", ["youtubeId"])
    .index("by_slug", ["slug"])
    .index("by_publishedAt", ["publishedAt"])
    .searchIndex("by_searchText", { searchField: "searchText" }),

  playlists: defineTable({
    youtubeId: v.string(),
    title: v.string(),
    description: v.string(),
    thumbnail: v.string(),
    itemCount: v.number(),
    displayOrder: v.optional(v.number()),
    visible: v.boolean(),
  }).index("by_youtubeId", ["youtubeId"]),
});
