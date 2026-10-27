"use client";
import { useSyncExternalStore } from "react";
import { dayKey } from "./quiz-select";
function subscribe(fn: () => void) {
  const timer = setInterval(fn, 30000);
  window.addEventListener("focus", fn);
  return () => {
    clearInterval(timer);
    window.removeEventListener("focus", fn);
  };
}
export function useLocalDay() {
  return useSyncExternalStore(
    subscribe,
    () => dayKey(new Date()),
    () => "",
  );
}
