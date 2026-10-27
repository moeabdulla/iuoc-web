import { Brand } from "@/components/courtyard/brand";
import Link from "next/link";
import { CourtyardPreferences } from "@/components/courtyard/preferences";
import { siteConfig } from "@/lib/site";

const pages = [
  ["About", "/about"],
  ["Library", "/videos"],
  ["Quran", "/quran"],
  ["Prayer times", "/prayer-times"],
  ["Daily question", "/daily-question"],
  ["Daily quote", "/daily-quote"],
  ["Support", "/support"],
  ["App", "/app"],
  ["Privacy", "/app/privacy"],
];
export function SiteFooter() {
  return (
    <footer className="courtyard-footer">
      <div className="courtyard-footer-main">
        <Link className="courtyard-footer-brand" href="/">
          <Brand />
        </Link>
        <nav aria-label="Footer">
          <div>
            {pages.map(([name, href]) => (
              <Link href={href} key={href}>
                {name}
              </Link>
            ))}
          </div>
          <div>
            {[
              ["YouTube", siteConfig.links.youtube],
              ["Instagram", siteConfig.links.instagram],
              ["TikTok", siteConfig.links.tiktok],
            ].map(([name, href]) => (
              <a key={name} href={href} target="_blank" rel="noreferrer">
                {name}
              </a>
            ))}
          </div>
        </nav>
        <CourtyardPreferences />
      </div>
      <div className="courtyard-footer-note">
        <span>© {new Date().getFullYear()} Project IUoC</span>
        <span>“…may Allah accept from us all.”</span>
      </div>
    </footer>
  );
}
