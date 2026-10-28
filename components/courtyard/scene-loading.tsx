"use client";

import { useEffect, useId, type RefObject } from "react";
import { Brand } from "./brand";
import { watchSceneReadiness } from "@/lib/courtyard/scene-readiness";

export function SceneLoading({
  entrance,
}: {
  entrance: RefObject<HTMLDivElement | null>;
}) {
  const patternId = useId();
  // Parent layout effects choose the mobile/desktop renderer first.
  useEffect(() => {
    const home = entrance.current?.closest<HTMLElement>(".courtyard-home");
    if (home) return watchSceneReadiness(home);
  }, [entrance]);
  return (
    <>
      <div className="courtyard-scene-loading">
        <svg
          className="courtyard-loading-pattern"
          aria-hidden="true"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern
              id={patternId}
              width="160"
              height="160"
              patternUnits="userSpaceOnUse"
            >
              <path d="M80 8 99 35 132 28 125 61 152 80 125 99 132 132 99 125 80 152 61 125 28 132 35 99 8 80 35 61 28 28 61 35Z" />
              <path d="M0 0 28 28M160 0 132 28M160 160 132 132M0 160 28 132" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </svg>
        <div className="courtyard-loading-content">
          <Brand />
          <p role="status">Opening the library…</p>
          <span className="courtyard-loading-rule" aria-hidden="true" />
          <button
            className="courtyard-loading-skip"
            onClick={() => {
              const home =
                entrance.current?.closest<HTMLElement>(".courtyard-home");
              if (home) home.dataset.sceneLoading = "ready";
            }}
          >
            Continue without waiting
          </button>
        </div>
      </div>
      <noscript>
        <style>{`.courtyard-scene-loading{display:none!important}.courtyard-home :is(.courtyard-background,.entrance-stage,.courtyard-library){visibility:visible!important}`}</style>
      </noscript>
    </>
  );
}
