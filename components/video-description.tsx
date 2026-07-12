"use client";

import { useEffect, useRef, useState } from "react";

export function VideoDescription({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const paragraphRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = paragraphRef.current;
    if (!el) return;
    setOverflowing(el.scrollHeight > el.clientHeight + 1);
  }, [description]);

  if (!description) return null;

  return (
    <div>
      <p
        ref={paragraphRef}
        className={`whitespace-pre-line text-base leading-relaxed text-foreground/80 ${
          expanded ? "" : "line-clamp-4"
        }`}
      >
        {description}
      </p>
      {(overflowing || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-3 text-sm font-semibold text-primary hover:underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
