"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Brand } from "./brand";
import { ThemeToggle } from "@/components/theme-toggle";
import "./courtyard.css";
import "./journey.css";
import "./experience.css";
import "./art-previews.css";
const links = [
  { href: "/videos", label: "Library" },
  { href: "/quran", label: "Quran" },
  { href: "/prayer-times", label: "Prayer times" },
  { href: "/about", label: "About" },
];
export function CourtyardHeader() {
  const path = usePathname();
  return (
    <header
      className={`courtyard-header${path !== "/" ? " courtyard-header-inner" : ""}`}
    >
      <div className="courtyard-header-bar">
        <Link
          href="/"
          className="courtyard-wordmark"
          aria-label="Project IUoC home"
        >
          <Brand />
        </Link>
        <nav className="courtyard-desktop-nav" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={path === l.href ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="courtyard-header-actions">
          <Sheet>
            <SheetTrigger asChild>
              <button aria-label="Open menu">
                <Menu size={23} />
              </button>
            </SheetTrigger>
            <SheetContent className="courtyard-menu">
              <SheetTitle>Project IUoC</SheetTitle>
              <SheetDescription>
                Explore the library and daily tools.
              </SheetDescription>
              <nav aria-label="All pages">
                {[
                  ...links,
                  { href: "/daily-question", label: "Daily question" },
                  { href: "/daily-quote", label: "Daily quote" },
                  { href: "/app", label: "IUoC app" },
                  { href: "/support", label: "Support" },
                ].map((l) => (
                  <SheetClose asChild key={l.href}>
                    <Link href={l.href}>{l.label}</Link>
                  </SheetClose>
                ))}
              </nav>
              <ThemeToggle />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
