"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

/** The same edge-colour approach as the portfolio's BrowserChrome component.
 * Synchronize Safari's background fallback; never add an overlay over content. */
export function BrowserChrome() {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  useLayoutEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const mobile = matchMedia(
      "(hover:none) and (pointer:coarse), (max-width:700px)",
    );
    const metas = Array.from(
      document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
    );
    const previous = {
      root: root.style.backgroundColor,
      body: body.style.backgroundColor,
      metas: metas.map((meta) => meta.content),
    };
    let frame = 0,
      active = true,
      lastTop = "",
      lastBottom = "";
    function restore() {
      root.style.backgroundColor = previous.root;
      body.style.backgroundColor = previous.body;
      metas.forEach((meta, i) => {
        meta.content = previous.metas[i];
      });
      lastTop = lastBottom = "";
    }
    function backgroundAt(y: number) {
      const material = document
        .elementsFromPoint(innerWidth / 2, y)
        .map((el) =>
          el.closest(
            ".courtyard-paper, .reading-sheet, .courtyard-footer, .courtyard-close, .courtyard-home",
          ),
        )
        .find(Boolean);
      let element: Element | null = material ?? null;
      while (element && element !== body) {
        const colour = getComputedStyle(element).backgroundColor;
        if (colour !== "transparent" && colour !== "rgba(0, 0, 0, 0)")
          return colour;
        element = element.parentElement;
      }
      // Photographic scenery has no single solid pixel colour. Emerald is the
      // shared architectural backing rather than the light reading-paper token.
      return "#082f26";
    }
    function update() {
      frame = 0;
      if (!mobile.matches) {
        if (lastTop) restore();
        return;
      }
      const viewport = window.visualViewport;
      const topY = Math.max(1, viewport?.offsetTop ?? 0);
      const bottomY = Math.min(
        innerHeight - 1,
        topY + (viewport?.height ?? innerHeight) - 1,
      );
      const top = getComputedStyle(
        document.querySelector(".courtyard-header") ?? root,
      ).backgroundColor;
      const bottom = backgroundAt(bottomY);
      if (top !== lastTop) {
        root.style.backgroundColor = top;
        metas.forEach((meta) => {
          meta.content = top;
        });
        lastTop = top;
      }
      if (bottom !== lastBottom) {
        body.style.backgroundColor = bottom;
        lastBottom = bottom;
      }
    }
    const schedule = () => {
      if (active && !frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("pageshow", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("scroll", schedule);
    mobile.addEventListener("change", schedule);
    const observer = new ResizeObserver(schedule);
    const content = document.querySelector("main");
    if (content) observer.observe(content);
    document.fonts.ready.then(schedule);
    update();
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pageshow", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("scroll", schedule);
      mobile.removeEventListener("change", schedule);
      restore();
    };
  }, [pathname, resolvedTheme]);
  return null;
}
