import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { VideoExplorer } from "@/components/video-explorer";
import { ReadingShell } from "@/components/courtyard/reading-shell";
export const revalidate = 3600;
export const metadata: Metadata = { title: "The library" };
export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const [series, initialVideos, tags, params] = await Promise.all([
    fetchQuery(api.playlists.listVisible, {}),
    fetchQuery(api.videos.latest, { limit: 9 }),
    fetchQuery(api.videos.allTags, {}),
    searchParams,
  ]);
  return (
    <ReadingShell className="library-page">
      <h1>The library</h1>
      <VideoExplorer
        initialVideos={initialVideos}
        tags={tags}
        series={series}
        initialView={params.view === "series" ? "series" : "lessons"}
      />
    </ReadingShell>
  );
}
