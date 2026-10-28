"use client";

import { useEffect, type RefObject } from "react";
import { ArtworkLoading } from "./artwork-loading";
import { watchSceneReadiness } from "@/lib/courtyard/scene-readiness";

export function SceneLoading({
  entrance,
}: {
  entrance: RefObject<HTMLDivElement | null>;
}) {
  // Parent layout effects choose the mobile/desktop renderer first.
  useEffect(() => {
    const home = entrance.current?.closest<HTMLElement>(".courtyard-home");
    if (home) return watchSceneReadiness(home);
  }, [entrance]);
  return (
    <ArtworkLoading
      message="Opening the library…"
      onContinue={() => {
        const home = entrance.current?.closest<HTMLElement>(".courtyard-home");
        if (home) home.dataset.sceneLoading = "ready";
      }}
    />
  );
}
