import { ToolShell } from "@/components/daily/tool-shell";
import { DailyVerse } from "@/components/daily/daily-verse";
export const metadata = {
  title: "Daily quote",
  description:
    "A daily verse from the Quran. Read, save and share an ayah from Project IUoC.",
};
export default function Page() {
  return (
    <ToolShell title="Daily quote" icon="quran">
      <DailyVerse showHeading={false} />
    </ToolShell>
  );
}
