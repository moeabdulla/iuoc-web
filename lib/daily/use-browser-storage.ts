"use client";
import { useCallback, useMemo, useSyncExternalStore } from "react";
const event = "iuoc:storage";
function subscribe(listener: () => void) {
  const onStorage = () => {
    memory.clear();
    listener();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(event, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(event, listener);
  };
}
/** Stable string snapshots also work when storage is disabled or full. */
const memory = new Map<string, string>();
export function useBrowserStorage<T>(key: string, fallback: T) {
  const read = useCallback(() => {
    try {
      return memory.get(key) ?? localStorage.getItem(key) ?? null;
    } catch {
      return memory.get(key) ?? null;
    }
  }, [key]);
  const raw = useSyncExternalStore(subscribe, read, () => null);
  const value = useMemo(() => {
    try {
      return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  }, [raw, fallback]);
  const save = useCallback(
    (next: T) => {
      const json = JSON.stringify(next);
      memory.set(key, json);
      try {
        localStorage.setItem(key, json);
      } catch {}
      window.dispatchEvent(new Event(event));
    },
    [key],
  );
  return [value, save] as const;
}
