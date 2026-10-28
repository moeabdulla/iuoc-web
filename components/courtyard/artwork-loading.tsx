"use client";

import { useId } from "react";
import { Brand } from "./brand";

export function ArtworkLoading({
  message,
  onContinue,
}: {
  message: string;
  onContinue: () => void;
}) {
  const patternId = useId();
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
          <p role="status">{message}</p>
          <span className="courtyard-loading-rule" aria-hidden="true" />
          <button className="courtyard-loading-skip" onClick={onContinue}>
            Continue without waiting
          </button>
        </div>
      </div>
      <noscript>
        <style>{`.courtyard-scene-loading{display:none!important}.courtyard-home :is(.courtyard-background,.entrance-stage,.courtyard-library),.reading-scene>.reading-scene-art,.reading-scene>.reading-sheet{visibility:visible!important}.courtyard-decoded-image{opacity:1!important}`}</style>
      </noscript>
    </>
  );
}
