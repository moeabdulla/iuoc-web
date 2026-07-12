"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { siteConfig } from "@/lib/site";

// The masthead is full height at the top of the page for presence, then
// compacts to a slim bar once the reader scrolls past the fold — keeping the
// "forehead" out of the way while reading. A rAF-throttled scroll listener
// toggles the shrunk state; sticky, blur, drawer and theme toggle are kept.
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrolled(window.scrollY > 24));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b-[3px] border-double border-foreground/70 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div
        className={
          "container flex items-center justify-between gap-4 transition-[height] duration-300 ease-out " +
          (scrolled ? "h-14" : "h-24 md:h-28")
        }
      >
        <Link
          href="/"
          className="group flex items-center gap-3"
          aria-label={`${siteConfig.name} home`}
        >
          <Logo
            className={
              "transition-all duration-300 ease-out group-hover:-rotate-6 " +
              (scrolled
                ? "h-9 w-9 md:h-10 md:w-10"
                : "h-[4.5rem] w-[4.5rem] md:h-20 md:w-20")
            }
          />
          <span className="flex flex-col leading-none">
            <span className="font-serif text-lg font-semibold tracking-tight">
              {siteConfig.name}
            </span>
            <span
              className={
                "mt-1 text-[0.7rem] font-medium uppercase tracking-[0.28em] text-primary " +
                (scrolled ? "hidden" : "hidden sm:block")
              }
            >
              Knowledge for everyone
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <nav aria-label="Main" className="mr-2 hidden items-center gap-8 md:flex">
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="nav-underline py-1 text-sm font-medium text-foreground/75 transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
