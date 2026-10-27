"use client";

import { useSyncExternalStore } from "react";
const EVENT = "iuoc:motion";
const KEY = "iuoc.motion.v1";
function snapshot() {
  try {
    return (
      localStorage.getItem(KEY) === "off" ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  } catch {
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
}
function subscribe(listener: () => void) {
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", listener);
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    media.removeEventListener("change", listener);
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
export function useMotionPreference() {
  const reduced = useSyncExternalStore(subscribe, snapshot, () => false);
  function toggle() {
    try {
      localStorage.setItem(KEY, reduced ? "on" : "off");
    } catch {
      /* Session remains usable without storage. */
    }
    window.dispatchEvent(new Event(EVENT));
  }
  return { reduced, toggle };
}
