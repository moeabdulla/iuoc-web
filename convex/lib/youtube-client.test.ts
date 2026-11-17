import { describe, expect, it, vi } from "vitest";
import { createYouTubeClient } from "./youtube-client";

const apiKey = "test-key-not-a-real-credential";
const json = (value: unknown, status = 200) => Response.json(value, { status });

describe("internal YouTube client", () => {
  it("refuses missing configuration before making requests", () => {
    const fetcher = vi.fn();
    expect(() => createYouTubeClient({ apiKey: "", fetcher })).toThrow(
      "YOUTUBE_API_KEY",
    );
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("paginates within the same request budget and adds a timeout", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(json({ items: [1], nextPageToken: "second" }))
      .mockResolvedValueOnce(json({ items: [2] }));
    const client = createYouTubeClient({ apiKey, fetcher });
    expect(
      await client.listAll("playlistItems", { playlistId: "example" }),
    ).toEqual([1, 2]);
    const [url, options] = fetcher.mock.calls[1];
    expect(new URL(String(url)).searchParams.get("pageToken")).toBe("second");
    expect(options?.signal).toBeInstanceOf(AbortSignal);
  });

  it("aborts repeated page tokens instead of spending quota indefinitely", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementation(async () =>
        json({ items: [], nextPageToken: "repeated" }),
      );
    const client = createYouTubeClient({ apiKey, fetcher });
    await expect(client.listAll("playlists", {})).rejects.toThrow(
      "repeated a token",
    );
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("shares the request cap between listing and detail requests", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementation(async () => json({ items: [] }));
    const client = createYouTubeClient({ apiKey, fetcher, maximumRequests: 2 });
    await client.listAll("playlists", {});
    await client.page("videos", {});
    await expect(client.page("videos", {})).rejects.toThrow(
      "request budget exceeded",
    );
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("does not treat a malformed successful response as an empty catalogue", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(json({ unexpected: true }));
    await expect(
      createYouTubeClient({ apiKey, fetcher }).listAll("playlists", {}),
    ).rejects.toThrow("incomplete page");
  });

  it("keeps upstream bodies and credential-bearing network errors out of logs", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(json({ error: apiKey }, 403))
      .mockRejectedValueOnce(new Error(`failed URL?key=${apiKey}`));
    const client = createYouTubeClient({ apiKey, fetcher });
    await expect(client.page("videos", {})).rejects.toThrow(
      /^YouTube API videos failed: 403$/,
    );
    await expect(client.page("videos", {})).rejects.toThrow(
      /^YouTube API videos request failed or timed out$/,
    );
  });
});
