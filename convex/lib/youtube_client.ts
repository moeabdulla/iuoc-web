/** Used only by the internal import action, never by a browser-facing function. */
const API = "https://www.googleapis.com/youtube/v3";
type Resource = "playlistItems" | "videos" | "playlists";
export type YouTubePage<T> = { items: T[]; nextPageToken?: string };

export function createYouTubeClient({
  apiKey,
  fetcher = fetch,
  maximumRequests = 500,
}: {
  apiKey: string | undefined;
  fetcher?: typeof fetch;
  maximumRequests?: number;
}) {
  if (!apiKey?.trim()) throw new Error("YOUTUBE_API_KEY is not set");
  let requests = 0;

  async function page<T>(
    resource: Resource,
    params: Record<string, string>,
  ): Promise<YouTubePage<T>> {
    if (++requests > maximumRequests) {
      throw new Error(
        "YouTube import request budget exceeded; catalogue was not pruned.",
      );
    }
    const query = new URLSearchParams({ ...params, key: apiKey! });
    let response: Response;
    try {
      response = await fetcher(`${API}/${resource}?${query}`, {
        signal: AbortSignal.timeout(15_000),
      });
    } catch {
      // Network errors can contain the request URL, including the API key.
      throw new Error(`YouTube API ${resource} request failed or timed out`);
    }
    if (!response.ok) {
      // Do not copy upstream bodies or credential-bearing URLs into logs.
      throw new Error(`YouTube API ${resource} failed: ${response.status}`);
    }
    const value: unknown = await response.json();
    if (
      value === null ||
      typeof value !== "object" ||
      !("items" in value) ||
      !Array.isArray(value.items) ||
      ("nextPageToken" in value && typeof value.nextPageToken !== "string")
    ) {
      throw new Error(`YouTube API ${resource} returned an incomplete page`);
    }
    return value as YouTubePage<T>;
  }

  async function listAll<T>(
    resource: Resource,
    params: Record<string, string>,
  ) {
    const items: T[] = [];
    const seenTokens = new Set<string>();
    let token: string | undefined;
    do {
      const result = await page<T>(resource, {
        ...params,
        maxResults: "50",
        ...(token ? { pageToken: token } : {}),
      });
      items.push(...result.items);
      token = result.nextPageToken;
      if (token) {
        if (seenTokens.has(token)) {
          throw new Error(
            "YouTube pagination repeated a token; catalogue was not pruned.",
          );
        }
        seenTokens.add(token);
      }
    } while (token);
    return items;
  }

  return { page, listAll };
}
