import { ToolShell } from "@/components/daily/tool-shell";
import { PrayerTool } from "@/components/daily/prayer";
export const metadata = {
  title: "Prayer times",
  description:
    "Prayer times with selectable calculation methods, Asr settings, locations and minute adjustments.",
};
export default function Page() {
  return (
    <ToolShell title="Prayer times" icon="prayer-times">
      <PrayerTool />
    </ToolShell>
  );
}
