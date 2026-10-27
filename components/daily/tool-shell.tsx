import Link from "next/link";
import { ReadingShell } from "@/components/courtyard/reading-shell";
import { ArrowLeft } from "lucide-react";
import { ToolIcon } from "@/components/courtyard/art";
import "./daily.css";
export function ToolShell({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <ReadingShell className="daily-page">
      <div className="daily-panel">
        <Link href="/#library" className="daily-back">
          <ArrowLeft size={17} /> The library
        </Link>
        <header className="daily-heading">
          <ToolIcon name={icon} />
          <h1>{title}</h1>
        </header>
        {children}
      </div>
    </ReadingShell>
  );
}
