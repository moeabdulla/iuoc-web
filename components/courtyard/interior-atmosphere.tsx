"use client";
import { useEffect, useRef } from "react";

/** Restrained ambient light only; no extra plants or scenery layers. */
export function InteriorAtmosphere() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    const home = el?.closest<HTMLElement>(".courtyard-home");
    if (!el || !home) return;
    let visible = true;
    const update = () => {
      el.dataset.active = String(visible && !document.hidden);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(home);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  return (
    <div ref={root} className="interior-atmosphere" aria-hidden="true">
      <div className="interior-sunlight" />
    </div>
  );
}
