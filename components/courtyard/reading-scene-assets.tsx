"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ArtworkLoading } from "./artwork-loading";
import { displayHeight } from "@/lib/courtyard/display-height";
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
    const node = root.current;
    if (!node) return;
    const touch = matchMedia("(hover: none) and (pointer: coarse)");
    const syncHeight = () => {
      if (touch.matches) {
        node.style.setProperty(
          "--reading-screen-height",
          `${displayHeight()}px`,
        );
      } else {
        node.style.removeProperty("--reading-screen-height");
      }
    };
    syncHeight();
    window.addEventListener("resize", syncHeight);
    touch.addEventListener("change", syncHeight);
    const stopLoading = watchReadingReadiness(node);
    return () => {
      window.removeEventListener("resize", syncHeight);
      touch.removeEventListener("change", syncHeight);
      stopLoading();
    };
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
