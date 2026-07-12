"use client";

import { useEffect, useState } from "react";

// Tracks scroll direction to hide the masthead on downward scroll and reveal
// it on any upward scroll. Always revealed within `threshold` px of the top.
// A small deadzone absorbs jitter; scrollY is clamped to >= 0 so the iOS
// rubber-band overscroll at the top never toggles the header. rAF-throttled.
export function useHideOnScroll(threshold = 80, deadzone = 6): boolean {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = Math.max(0, window.scrollY);
    let raf = 0;

    const update = () => {
      raf = 0;
      const y = Math.max(0, window.scrollY);
      if (y <= threshold) {
        setHidden(false);
      } else if (y > last + deadzone) {
        setHidden(true);
      } else if (y < last - deadzone) {
        setHidden(false);
      }
      last = y;
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [threshold, deadzone]);

  return hidden;
}
