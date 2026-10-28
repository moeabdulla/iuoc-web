import type { ReactNode } from "react";
import { ReadingSceneAssets } from "./reading-scene-assets";

/** Shared still architecture: content scrolls normally and playback has no parallax. */
export function ReadingScene({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ReadingSceneAssets className={className}>{children}</ReadingSceneAssets>
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
