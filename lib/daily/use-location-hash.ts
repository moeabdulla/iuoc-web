"use client";
import { useSyncExternalStore } from "react";
function subscribe(fn: () => void) {
  window.addEventListener("hashchange", fn);
  window.addEventListener("popstate", fn);
  return () => {
    window.removeEventListener("hashchange", fn);
    window.removeEventListener("popstate", fn);
  };
}
/** Next's client navigation can set a fragment through history rather than a
 * native anchor visit, so CSS :target alone does not mark a shared ayah. */
export function useLocationHash() {
  return useSyncExternalStore(
    subscribe,
    () => location.hash,
    () => "",
  );
}
