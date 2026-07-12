import type { Metadata } from "next";
import { Gift, Instagram, Repeat, Wallet, Youtube } from "lucide-react";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Support",
};

const donationCards = [
  {
    icon: Repeat,
    name: "Patreon",
    action: "Become a monthly supporter",
    href: siteConfig.links.patreon,
    emphasized: true,
  },
  {
    icon: Gift,
    name: "GoFundMe",
    action: "Make a one-time donation",
    href: siteConfig.links.gofundme,
    emphasized: false,
  },
  {
    icon: Wallet,
    name: "PayPal",
    action: "Make a one-time donation",
    href: siteConfig.links.paypal,
    emphasized: false,
  },
];

const socialLinks = [
  { href: siteConfig.links.youtube, label: "YouTube", icon: Youtube },
  { href: siteConfig.links.instagram, label: "Instagram", icon: Instagram },
];

export default function SupportPage() {
  return (
    <div className="container space-y-20 pb-24 pt-14 md:space-y-24 md:pt-20">
      <header className="max-w-2xl">
        <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          <span aria-hidden className="h-px w-6 bg-primary/60" />
          Sadaqah jariyah
        </p>
        <h1 className="font-serif text-4xl leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
          Help keep this knowledge free for everyone.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          Every video, reminder, and series is free to watch, funded entirely
          by people who believe this knowledge should stay that way. Your
          support goes directly toward the research, animation, and
          production that carry the work forward.
        </p>
      </header>

      <section aria-labelledby="donate-heading">
        <h2 id="donate-heading" className="sr-only">
          Ways to give
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {donationCards.map(({ icon: Icon, name, action, href, emphasized }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={
                "group flex flex-col rounded-2xl border p-7 transition-colors " +
                (emphasized
                  ? "border-transparent bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
                  : "border-border/70 bg-card/60 hover:border-primary/50")
              }
            >
              <span
                className={
                  "flex size-11 items-center justify-center rounded-full " +
                  (emphasized
                    ? "bg-primary-foreground/15 text-primary-foreground"
                    : "bg-primary/10 text-primary")
                }
              >
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="mt-6 font-serif text-xl tracking-tight">
                {name}
              </span>
              <span
                className={
                  "mt-2 text-sm leading-relaxed " +
                  (emphasized
                    ? "text-primary-foreground/85"
                    : "text-muted-foreground")
                }
              >
                {action}
              </span>
            </a>
          ))}
        </div>
      </section>

      <section aria-labelledby="follow-heading" className="text-center">
        <h2
          id="follow-heading"
          className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
        >
          Prefer to follow along instead?
        </h2>
        <div className="mt-5 flex items-center justify-center gap-3">
          {socialLinks.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex size-11 items-center justify-center rounded-full border border-border/70 text-foreground/70 transition-colors hover:border-primary hover:text-primary"
            >
              <Icon className="size-5" aria-hidden />
            </a>
          ))}
        </div>
      </section>

      <p className="mx-auto max-w-md text-center font-serif text-xl leading-snug tracking-tight text-foreground/90 md:text-2xl">
        JazakAllah khair for your generosity &mdash; may Allah accept from us
        all.
      </p>
    </div>
  );
}
