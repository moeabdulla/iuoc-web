import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import {
  buildSearchText,
  chunk,
  makeSlug,
  mergeVideo,
  parseIso8601Duration,
  staleYoutubeIds,
} from "./lib/youtube";

import { createYouTubeClient } from "./lib/youtube-client";

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
  isShort: v.optional(v.boolean()),
});

const playlistValidator = v.object({
  youtubeId: v.string(),
  title: v.string(),
  description: v.string(),
  thumbnail: v.string(),
  itemCount: v.number(),
});

interface YtThumbnail {
  url: string;
}

interface YtThumbnails {
  default?: YtThumbnail;
  medium?: YtThumbnail;
  high?: YtThumbnail;
  standard?: YtThumbnail;
  maxres?: YtThumbnail;
}

interface YtPlaylistItem {
  contentDetails?: { videoId?: string };
}

interface YtVideoItem {
  id: string;
  snippet: {
    title: string;
    description?: string;
    publishedAt: string;
    thumbnails?: YtThumbnails;
  };
  contentDetails?: { duration?: string };
}

interface YtPlaylist {
  id: string;
  snippet: {
    title: string;
    description?: string;
    thumbnails?: YtThumbnails;
  };
  contentDetails?: { itemCount?: number };
}

function bestThumbnail(thumbnails: YtThumbnails | undefined): string {
  return (
    thumbnails?.maxres?.url ??
    thumbnails?.standard?.url ??
    thumbnails?.high?.url ??
    thumbnails?.medium?.url ??
    thumbnails?.default?.url ??
    ""
  );
}

// YouTube redirects /shorts/{id} to the canonical /watch page (3xx) for
// regular videos, but serves it directly (200) for actual Shorts.
// Verified live against known short/regular video ids.
async function probeIsShort(videoId: string): Promise<boolean | undefined> {
  try {
    const res = await fetch(`https://www.youtube.com/shorts/${videoId}`, {
      method: "HEAD",
      redirect: "manual",
      signal: AbortSignal.timeout(5000),
    });
    return res.status === 200;
  } catch {
    return undefined;
  }
}

export const run = internalAction({
  args: {},
  handler: async (ctx) => {
    const channelId = process.env.YOUTUBE_CHANNEL_ID?.trim();
    const uploadsId = process.env.YOUTUBE_UPLOADS_PLAYLIST_ID?.trim();
    if (!channelId || !uploadsId) {
      throw new Error(
        "YOUTUBE_CHANNEL_ID and YOUTUBE_UPLOADS_PLAYLIST_ID must be set",
      );
    }
    const { page: ytFetch, listAll } = createYouTubeClient({
      apiKey: process.env.YOUTUBE_API_KEY,
    });

    // 1. All uploaded video ids
    const uploadItems = await listAll<YtPlaylistItem>("playlistItems", {
      part: "contentDetails",
      playlistId: uploadsId,
    });
    const videoIds = [
      ...new Set(
        uploadItems
          .map((i) => i.contentDetails?.videoId)
          .filter((id): id is string => typeof id === "string"),
      ),
    ];
    if (videoIds.length === 0) {
      throw new Error(
        "YouTube uploads returned no videos; keeping the existing catalogue",
      );
    }

    // 2. Canonical video metadata in batches of 50
    const rawVideos: YtVideoItem[] = [];
    for (const ids of chunk(videoIds, 50)) {
      const page = await ytFetch<YtVideoItem>("videos", {
        part: "snippet,contentDetails",
        id: ids.join(","),
      });
      rawVideos.push(...(page.items ?? []));
    }

    // 3. Playlists and their membership
    const rawPlaylists = await listAll<YtPlaylist>("playlists", {
      part: "snippet,contentDetails",
      channelId,
    });
    const membership = new Map<string, string[]>();
    for (const p of rawPlaylists) {
      const items = await listAll<YtPlaylistItem>("playlistItems", {
        part: "contentDetails",
        playlistId: p.id,
      });
      for (const item of items) {
        const vid = item.contentDetails?.videoId;
        if (!vid) continue;
        membership.set(vid, [...(membership.get(vid) ?? []), p.id]);
      }
    }

    const videosBase = rawVideos.map((raw) => ({
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

    // 4. Probe Shorts status only for videos we don't already know about,
    // so re-ingests don't re-probe the whole channel every time.
    const knownStatuses = await ctx.runQuery(
      internal.ingest.knownShortStatuses,
      {},
    );
    const knownMap = new Map(
      knownStatuses.map((k) => [k.youtubeId, k.isShort]),
    );
    const toProbe = videosBase.filter(
      (video) => knownMap.get(video.youtubeId) === undefined,
    );

    const probedResults = new Map<string, boolean>();
    let probedCount = 0;
    for (const batch of chunk(toProbe, 10)) {
      const results = await Promise.all(
        batch.map(async (video) => ({
          youtubeId: video.youtubeId,
          isShort: await probeIsShort(video.youtubeId),
        })),
      );
      for (const { youtubeId, isShort } of results) {
        probedCount += 1;
        if (isShort !== undefined) {
          probedResults.set(youtubeId, isShort);
        }
      }
    }
    const shortsFound = [...probedResults.values()].filter(Boolean).length;
    console.log(
      `Probed ${probedCount} videos for Shorts status; found ${shortsFound} shorts`,
    );

    const videos = videosBase.map((video) => ({
      ...video,
      isShort: probedResults.has(video.youtubeId)
        ? probedResults.get(video.youtubeId)
        : knownMap.get(video.youtubeId),
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

    const removedCount = await ctx.runMutation(
      internal.ingest.removeStaleVideos,
      {
        currentYoutubeIds: videos.map((video) => video.youtubeId),
      },
    );

    console.log(
      `Ingested ${videos.length} videos, ${playlists.length} playlists; removed ${removedCount} stale videos`,
    );
  },
});

export const knownShortStatuses = internalQuery({
  args: {},
  handler: async (ctx) => {
    const videos = await ctx.db.query("videos").collect();
    return videos.map((video) => ({
      youtubeId: video.youtubeId,
      isShort: video.isShort,
    }));
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

export const removeStaleVideos = internalMutation({
  args: { currentYoutubeIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    // A genuinely empty result means the upstream fetch broke (bad env var,
    // API outage, etc.), not that every video vanished from YouTube -
    // refuse to wipe the catalog in that case.
    if (args.currentYoutubeIds.length === 0) {
      throw new Error(
        "removeStaleVideos: current fetch returned zero videos, refusing to delete the whole catalog",
      );
    }

    const existing = await ctx.db.query("videos").collect();
    const staleIds = staleYoutubeIds(
      existing.map((video) => video.youtubeId),
      args.currentYoutubeIds,
    );
    const staleSet = new Set(staleIds);
    const stale = existing.filter((video) => staleSet.has(video.youtubeId));

    for (const video of stale) {
      console.log(`Removing stale video: ${video.title} (${video.youtubeId})`);
      await ctx.db.delete(video._id);
    }

    return stale.length;
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
