import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { siteConfig } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4 md:h-[4.5rem]">
        <Link
          href="/"
          className="group flex items-center gap-3"
          aria-label={`${siteConfig.name} home`}
        >
          <Logo className="h-10 w-10 transition-transform duration-300 group-hover:-rotate-6" />
          <span className="flex flex-col leading-none">
            <span className="font-serif text-lg font-semibold tracking-tight">
              {siteConfig.name}
            </span>
            <span className="mt-1 hidden text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted-foreground sm:block">
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
