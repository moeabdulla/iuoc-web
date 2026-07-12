"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { useHideOnScroll } from "@/lib/use-hide-on-scroll";
import { siteConfig } from "@/lib/site";

// The masthead stays a full-presence bar, but gets out of the reader's way:
// scrolling down past the fold slides it fully out of view; any upward scroll
// brings it straight back. It is always shown at the top of the page. The
// slide is a transform (no layout thrash) and the hide/reveal logic lives in
// useHideOnScroll (rAF-throttled, overscroll-safe).
export function SiteHeader() {
  const hidden = useHideOnScroll();

  return (
    <header
      className={
        "sticky top-0 z-50 border-b-[3px] border-double border-foreground/70 bg-background transition-transform [transition-duration:250ms] ease-out " +
        (hidden ? "-translate-y-full" : "translate-y-0")
      }
    >
      <div className="container flex h-24 items-center justify-between gap-4 md:h-28">
        <Link
          href="/"
          className="group flex items-center gap-3"
          aria-label={`${siteConfig.name} home`}
        >
          <Logo className="h-20 w-20 transition-transform duration-300 ease-out group-hover:-rotate-6 md:h-24 md:w-24" />
          <span className="flex flex-col leading-none">
            <span className="font-serif text-lg font-semibold tracking-tight">
              {siteConfig.name}
            </span>
            <span className="mt-1 hidden text-[0.7rem] font-medium uppercase tracking-[0.28em] text-primary sm:block">
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
