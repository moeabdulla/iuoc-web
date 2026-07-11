export type MergeableVideo = {
  youtubeId: string;
  slug: string;
  title: string;
  description: string;
  publishedAt: number;
  thumbnail: string;
  durationSeconds: number;
  playlistIds: string[];
  tags: string[];
  featured: boolean;
  searchText: string;
};

export function parseIso8601Duration(iso: string): number {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  if (!match) return 0;
  const [, h, m, s] = match;
  return (Number(h ?? 0) * 3600) + (Number(m ?? 0) * 60) + Number(s ?? 0);
}

export function makeSlug(title: string, youtubeId: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
  const suffix = youtubeId.toLowerCase().replace(/[^a-z0-9]/g, "").slice(-4);
  return `${base.length > 0 ? base : "video"}-${suffix}`;
}

export function buildSearchText(title: string, description: string): string {
  return `${title}\n${description}`;
}

export function mergeVideo(
  existing: MergeableVideo,
  incoming: MergeableVideo,
): MergeableVideo {
  return {
    ...incoming,
    slug: existing.slug,
    tags: existing.tags,
    featured: existing.featured,
  };
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
