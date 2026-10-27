import { ReadingShell } from "@/components/courtyard/reading-shell";
import type { Metadata } from "next";
import {
  InstagramIcon,
  TikTokIcon,
  YouTubeIcon,
} from "@/components/social-icons";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Support",
};

const donationCards = [
  {
    name: "Patreon",
    cadence: "Monthly Pledge",
    action: "Become a monthly supporter",
    href: siteConfig.links.patreon,
    emphasized: true,
  },
  {
    name: "GoFundMe",
    cadence: "One-time Gift",
    action: "Make a one-time donation",
    href: siteConfig.links.gofundme,
    emphasized: false,
  },
  {
    name: "PayPal",
    cadence: "One-time Gift",
    action: "Make a one-time donation",
    href: siteConfig.links.paypal,
    emphasized: false,
  },
];

const socialLinks = [
  { href: siteConfig.links.youtube, label: "YouTube", icon: YouTubeIcon },
  { href: siteConfig.links.instagram, label: "Instagram", icon: InstagramIcon },
  { href: siteConfig.links.tiktok, label: "TikTok", icon: TikTokIcon },
];

export default function SupportPage() {
  return (
    <ReadingShell className="reading-info">
      <div className="space-y-14 md:space-y-20">
        <header className="mx-auto max-w-2xl text-center">
          <div aria-hidden className="text-sm tracking-[0.6em] text-gold">
            &#10022; &#10022; &#10022;
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-gold">
            Sadaqah Jariyah
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-[1.1] md:text-5xl">
            Help keep this knowledge free for everyone.
          </h1>
          <p className="mx-auto mt-6 max-w-xl font-serif text-lg leading-relaxed text-foreground/80">
            Every video, reminder, and series is free to watch, funded entirely
            by people who believe this knowledge should stay that way. Your
            support goes directly toward the research, animation, and production
            that carry the work forward.
          </p>
        </header>

        <section aria-labelledby="donate-heading">
          <h2 id="donate-heading" className="sr-only">
            Ways to give
          </h2>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
            {donationCards.map(
              ({ name, cadence, action, href, emphasized }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    "group flex flex-col border p-7 text-center transition-colors " +
                    (emphasized
                      ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border-foreground bg-secondary hover:border-primary")
                  }
                >
                  <span
                    className={
                      "text-[0.65rem] font-semibold uppercase tracking-[0.24em] " +
                      (emphasized ? "text-primary-foreground/80" : "text-gold")
                    }
                  >
                    {cadence}
                  </span>
                  <span className="mt-4 font-serif text-2xl">{name}</span>
                  <span
                    className={
                      "mt-2 text-sm italic leading-relaxed " +
                      (emphasized
                        ? "text-primary-foreground/85"
                        : "text-muted-foreground")
                    }
                  >
                    {action} &rarr;
                  </span>
                </a>
              ),
            )}
          </div>
        </section>

        <section aria-labelledby="follow-heading" className="text-center">
          <h2
            id="follow-heading"
            className="text-xs font-semibold uppercase tracking-[0.24em] text-gold"
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
                className="flex size-11 items-center justify-center rounded-full border border-border text-foreground/70 transition-colors hover:border-primary hover:text-primary"
              >
                <Icon className="size-5" aria-hidden />
              </a>
            ))}
          </div>
        </section>

        <p className="mx-auto max-w-md text-center font-serif text-xl italic leading-snug text-foreground/90 md:text-2xl">
          JazakAllah khair for your generosity &mdash; may Allah accept from us
          all.
        </p>
      </div>
    </ReadingShell>
  );
}
