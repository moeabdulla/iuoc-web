import { ToolShell } from "@/components/daily/tool-shell";
import { DailyQuiz } from "@/components/daily/quiz";
export const metadata = {
  title: "Daily question",
  description:
    "A daily question from Project IUoC. The same question as the app, with three attempts.",
};
export default function Page() {
  return (
    <ToolShell title="Daily question" icon="daily-question">
      <DailyQuiz />
    </ToolShell>
  );
}
