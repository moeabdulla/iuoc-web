import type { ReactNode } from "react";

/** Shared still architecture: content scrolls normally and playback has no parallax. */
export function ReadingScene({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`reading-scene ${className}`}>
      <div className="reading-scene-art" aria-hidden="true" />
      {children}
    </div>
  );
}
export function ReadingShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ReadingScene className={`reading-page ${className}`}>
      <div className="reading-sheet">{children}</div>
    </ReadingScene>
  );
}
