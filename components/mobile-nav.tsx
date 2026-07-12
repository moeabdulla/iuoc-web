"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "@/components/logo";
import { siteConfig } from "@/lib/site";

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
      <SheetContent side="right" className="w-full max-w-xs border-border/60">
        <SheetHeader className="text-left">
          <SheetTitle asChild>
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3"
            >
              <Logo className="h-9 w-9" />
              <span className="font-serif text-lg font-semibold tracking-tight">
                {siteConfig.name}
              </span>
            </Link>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Main navigation
          </SheetDescription>
        </SheetHeader>
        <nav className="mt-10 flex flex-col gap-1">
          {siteConfig.nav.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="group flex items-baseline gap-4 border-b border-border/50 py-4 font-serif text-2xl font-medium tracking-tight transition-colors hover:text-primary"
            >
              <span className="font-sans text-xs tabular-nums text-muted-foreground">
                0{index + 1}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
