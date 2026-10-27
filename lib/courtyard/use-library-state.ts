"use client";
import { useMemo, useSyncExternalStore } from "react";

type BrowseState = { search: string; view: "lessons" | "series"; tag?: string };
const EVENT = "iuoc:library-state";
const sessionMemory = new Map<string, string>();
function subscribe(listener: () => void) {
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
function read(key: string) {
  if (sessionMemory.has(key)) return sessionMemory.get(key)!;
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}
function decode(raw: string | null, view: BrowseState["view"]): BrowseState {
  try {
    const value = JSON.parse(raw ?? "null");
    if (
      value &&
      typeof value.search === "string" &&
      ["lessons", "series"].includes(value.view)
    ) {
      return {
        search: value.search.slice(0, 300),
        view: value.view,
        tag: typeof value.tag === "string" ? value.tag : undefined,
      };
    }
  } catch {
    /* A blocked or invalid session store should not prevent browsing. */
  }
  return { search: "", view };
}
/** Keep the reader's search/filter context when returning from a lesson. */
export function useLibraryState(initialView: BrowseState["view"]) {
  const key = `iuoc.library.v1.${initialView}`;
  const raw = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null,
  );
  const state = useMemo(() => decode(raw, initialView), [raw, initialView]);
  function update(patch: Partial<BrowseState>) {
    const next = JSON.stringify({ ...state, ...patch });
    sessionMemory.set(key, next);
    try {
      sessionStorage.setItem(key, next);
    } catch {
      /* In-memory browsing still works. */
    }
    window.dispatchEvent(new Event(EVENT));
  }
  return { state, update };
}
