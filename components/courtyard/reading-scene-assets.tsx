"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ArtworkLoading } from "./artwork-loading";
import { watchReadingReadiness } from "@/lib/courtyard/reading-readiness";

export function ReadingSceneAssets({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const path = usePathname();
  useLayoutEffect(() => {
    if (root.current) return watchReadingReadiness(root.current);
  }, [path]);
  return (
    <div
      ref={root}
      className={`reading-scene ${className}`}
      data-scene-loading="pending"
    >
      <div className="reading-scene-art" aria-hidden="true" />
      <ArtworkLoading
        message="Opening the page…"
        onContinue={() => {
          if (root.current) root.current.dataset.sceneLoading = "ready";
        }}
      />
      {children}
    </div>
  );
}
