import type { MetadataRoute } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { siteConfig } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await fetchQuery(api.videos.allSlugs, {});
  const staticPages = ["", "/videos", "/about", "/support"].map((path) => ({
    url: `${siteConfig.url}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
  const videoPages = slugs.map(({ slug, publishedAt }) => ({
    url: `${siteConfig.url}/videos/${slug}`,
    lastModified: new Date(publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  return [...staticPages, ...videoPages];
}
