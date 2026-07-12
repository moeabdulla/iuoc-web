"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "@/components/logo";
import { siteConfig } from "@/lib/site";

// "Home" leads the index so the branding block can be inert (no accidental
// home-tap when the reader grabs the logo). Numbered like a table of contents.
const navItems = [{ href: "/", label: "Home" }, ...siteConfig.nav];

export function MobileNav() {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-foreground/70 hover:text-foreground md:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      {/* The drawer reads as a manuscript leaf: inert masthead over a double
          rule, TOC-numbered nav rows, and a serif "Close" at the foot in place
          of the floating shadcn ✕ (hidden via [&>button]:hidden). */}
      <SheetContent
        side="right"
        className="flex w-full max-w-xs flex-col gap-0 border-l border-foreground/60 bg-background p-0 [&>button]:hidden"
      >
        <div className="border-b-[3px] border-double border-foreground/70 px-6 pb-6 pt-7">
          <div className="flex items-center gap-3.5">
            <Logo className="h-16 w-16 shrink-0" />
            <span className="flex flex-col leading-none">
              <SheetTitle className="font-serif text-xl font-semibold tracking-tight text-foreground">
                {siteConfig.name}
              </SheetTitle>
              <span className="mt-1.5 text-[0.65rem] font-medium uppercase tracking-[0.28em] text-primary">
                Knowledge for everyone
              </span>
            </span>
          </div>
          <SheetDescription className="sr-only">Main navigation</SheetDescription>
        </div>

        <nav aria-label="Mobile" className="flex flex-col px-6">
          {navItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="group flex items-baseline gap-4 border-b border-border/60 py-5 font-serif text-2xl tracking-tight transition-colors hover:text-primary"
            >
              <span className="font-sans text-xs tabular-nums text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div
          aria-hidden
          className="pt-8 text-center text-sm tracking-[0.5em] text-gold"
        >
          &#10022;
        </div>

        <div className="mt-auto border-t border-border px-6 py-5">
          <SheetClose className="font-serif text-sm uppercase tracking-[0.25em] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:underline">
            Close
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
