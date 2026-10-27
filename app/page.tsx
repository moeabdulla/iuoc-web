import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { CourtyardEntrance } from "@/components/courtyard/entrance";
import { HomeContent } from "@/components/courtyard/home-content";
import "@/components/courtyard/courtyard.css";

export const revalidate = 3600;
export default async function HomePage() {
  const [featured, latest, series] = await Promise.all([
    fetchQuery(api.videos.featured, {}),
    fetchQuery(api.videos.latest, { limit: 9 }),
    fetchQuery(api.playlists.listVisible, {}),
  ]);
  return (
    <CourtyardEntrance>
      <HomeContent featured={featured} latest={latest} series={series} />
    </CourtyardEntrance>
  );
}
