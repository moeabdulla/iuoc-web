import Link from "next/link";
import { Instagram, Youtube } from "lucide-react";
import { Logo } from "@/components/logo";
import { siteConfig } from "@/lib/site";

const socialLinks = [
  { href: siteConfig.links.youtube, label: "YouTube", icon: Youtube },
  { href: siteConfig.links.instagram, label: "Instagram", icon: Instagram },
];

const supportLinks = [
  { href: siteConfig.links.patreon, label: "Patreon" },
  { href: siteConfig.links.gofundme, label: "GoFundMe" },
  { href: siteConfig.links.paypal, label: "PayPal" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/30">
      <div className="container grid gap-12 py-16 md:grid-cols-[1.6fr_1fr_1fr_1fr] md:gap-8">
        <div className="max-w-sm">
          <Link href="/" className="flex items-center gap-3">
            <Logo className="h-11 w-11" />
            <span className="font-serif text-xl font-semibold tracking-tight">
              {siteConfig.name}
            </span>
          </Link>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            {siteConfig.description}
          </p>
          <div className="mt-6 flex items-center gap-3">
            {socialLinks.map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex size-9 items-center justify-center rounded-full border border-border/70 text-foreground/70 transition-colors hover:border-primary hover:text-primary"
              >
                <Icon className="size-[1.1rem]" />
              </a>
            ))}
          </div>
        </div>

        <FooterColumn title="Explore">
          {siteConfig.nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title="Support the mission">
          {supportLinks.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title="Follow">
          {socialLinks.map(({ href, label }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </a>
            </li>
          ))}
        </FooterColumn>
      </div>

      <div className="border-t border-border/60">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
            reserved.
          </p>
          <p className="flex items-center gap-1.5">
            Sadaqah jariyah
            <span className="text-accent-red" aria-hidden>
              &#10022;
            </span>
            made in Canada
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-foreground/80">
        {title}
      </h2>
      <ul className="mt-4 space-y-3 text-sm">{children}</ul>
    </div>
  );
}
