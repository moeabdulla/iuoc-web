import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, internalMutation } from "./_generated/server";
import {
  buildSearchText,
  chunk,
  makeSlug,
  mergeVideo,
  parseIso8601Duration,
} from "./lib/youtube";

const API = "https://www.googleapis.com/youtube/v3";

const videoValidator = v.object({
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
});

const playlistValidator = v.object({
  youtubeId: v.string(),
  title: v.string(),
  description: v.string(),
  thumbnail: v.string(),
  itemCount: v.number(),
});

async function ytFetch(
  path: string,
  params: Record<string, string>,
): Promise<any> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YOUTUBE_API_KEY is not set");
  const qs = new URLSearchParams({ ...params, key });
  const res = await fetch(`${API}/${path}?${qs}`);
  if (!res.ok) {
    throw new Error(`YouTube API ${path} failed: ${res.status} ${await res.text()}`);
  }
  return await res.json();
}

async function listAll(
  path: string,
  params: Record<string, string>,
): Promise<any[]> {
  const items: any[] = [];
  let pageToken: string | undefined;
  do {
    const page = await ytFetch(path, {
      ...params,
      maxResults: "50",
      ...(pageToken ? { pageToken } : {}),
    });
    items.push(...(page.items ?? []));
    pageToken = page.nextPageToken;
  } while (pageToken);
  return items;
}

function bestThumbnail(thumbnails: any): string {
  return (
    thumbnails?.maxres?.url ??
    thumbnails?.standard?.url ??
    thumbnails?.high?.url ??
    thumbnails?.medium?.url ??
    thumbnails?.default?.url ??
    ""
  );
}

export const run = internalAction({
  args: {},
  handler: async (ctx) => {
    const channelId = process.env.YOUTUBE_CHANNEL_ID!;
    const uploadsId = process.env.YOUTUBE_UPLOADS_PLAYLIST_ID!;

    // 1. All uploaded video ids
    const uploadItems = await listAll("playlistItems", {
      part: "contentDetails",
      playlistId: uploadsId,
    });
    const videoIds = uploadItems
      .map((i) => i.contentDetails?.videoId)
      .filter((id): id is string => typeof id === "string");

    // 2. Canonical video metadata in batches of 50
    const rawVideos: any[] = [];
    for (const ids of chunk(videoIds, 50)) {
      const page = await ytFetch("videos", {
        part: "snippet,contentDetails",
        id: ids.join(","),
      });
      rawVideos.push(...(page.items ?? []));
    }

    // 3. Playlists and their membership
    const rawPlaylists = await listAll("playlists", {
      part: "snippet,contentDetails",
      channelId,
    });
    const membership = new Map<string, string[]>();
    for (const p of rawPlaylists) {
      const items = await listAll("playlistItems", {
        part: "contentDetails",
        playlistId: p.id,
      });
      for (const item of items) {
        const vid = item.contentDetails?.videoId;
        if (!vid) continue;
        membership.set(vid, [...(membership.get(vid) ?? []), p.id]);
      }
    }

    const videos = rawVideos.map((raw) => ({
      youtubeId: raw.id,
      slug: makeSlug(raw.snippet.title, raw.id),
      title: raw.snippet.title as string,
      description: (raw.snippet.description ?? "") as string,
      publishedAt: Date.parse(raw.snippet.publishedAt),
      thumbnail: bestThumbnail(raw.snippet.thumbnails),
      durationSeconds: parseIso8601Duration(raw.contentDetails?.duration ?? ""),
      playlistIds: membership.get(raw.id) ?? [],
      tags: [],
      featured: false,
      searchText: buildSearchText(
        raw.snippet.title,
        raw.snippet.description ?? "",
      ),
    }));

    const playlists = rawPlaylists.map((p) => ({
      youtubeId: p.id as string,
      title: p.snippet.title as string,
      description: (p.snippet.description ?? "") as string,
      thumbnail: bestThumbnail(p.snippet.thumbnails),
      itemCount: (p.contentDetails?.itemCount ?? 0) as number,
    }));

    for (const batch of chunk(videos, 100)) {
      await ctx.runMutation(internal.ingest.upsertVideos, { videos: batch });
    }
    await ctx.runMutation(internal.ingest.upsertPlaylists, { playlists });

    console.log(`Ingested ${videos.length} videos, ${playlists.length} playlists`);
  },
});

export const upsertVideos = internalMutation({
  args: { videos: v.array(videoValidator) },
  handler: async (ctx, args) => {
    for (const video of args.videos) {
      const existing = await ctx.db
        .query("videos")
        .withIndex("by_youtubeId", (q) => q.eq("youtubeId", video.youtubeId))
        .unique();
      if (existing === null) {
        await ctx.db.insert("videos", video);
      } else {
        await ctx.db.patch(existing._id, mergeVideo(existing, video));
      }
    }
  },
});

export const upsertPlaylists = internalMutation({
  args: { playlists: v.array(playlistValidator) },
  handler: async (ctx, args) => {
    for (const playlist of args.playlists) {
      const existing = await ctx.db
        .query("playlists")
        .withIndex("by_youtubeId", (q) => q.eq("youtubeId", playlist.youtubeId))
        .unique();
      if (existing === null) {
        await ctx.db.insert("playlists", { ...playlist, visible: true });
      } else {
        await ctx.db.patch(existing._id, playlist);
      }
    }
  },
});
