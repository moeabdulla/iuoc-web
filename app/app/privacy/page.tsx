import { ReadingShell } from "@/components/courtyard/reading-shell";
import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Privacy Policy — IUoC app",
  description:
    "The IUoC mobile app collects nothing. No accounts, no analytics, no servers.",
};

// Both stores require a reachable privacy policy URL before a listing can be
// published, and this is that URL. It describes the MOBILE APP specifically,
// not this website.
//
// Every claim here was checked against the app's dependency list rather than
// assumed: there is no analytics SDK, no crash reporter, no advertising
// identifier and no RevenueCat. The only things that can touch a network are
// the reader's own cloud backup, which writes to their iCloud or Google Drive
// and never to us, and the OS location service, which answers on-device. If a
// dependency that phones home is ever added, this page has to change in the
// same commit.

const LAST_UPDATED = "20 August 2026";

const collected = [
  {
    title: "No account, ever",
    body: "There is no sign-up, no login and no profile. The app has no concept of who you are, so there is nothing to attach data to.",
  },
  {
    title: "No analytics, no tracking",
    body: "No analytics SDK, no crash reporter, no advertising identifier, no third-party tracker. We do not know how many times you open the app, what you read, or whether you use it at all.",
  },
  {
    title: "No servers of ours",
    body: "The Quran text, translations, tajweed data and the Hijri calendar table all ship inside the app. Reading, searching, bookmarking and the qibla all work with the device in airplane mode.",
  },
];

const onDevice = [
  {
    title: "Your bookmarks and reading position",
    body: "Stored in a database on your device. They are never transmitted.",
  },
  {
    title: "Your location, if you allow it",
    body: "Used only to compute the direction of the qibla and the distance to Makkah, and only while the screen is open. The calculation happens on your device. Your coordinates are never sent anywhere, and the app keeps no history of where you have been. Decline the permission and everything except the qibla bearing still works.",
  },
  {
    title: "Your settings",
    body: "Translation choice, Arabic text size, tajweed colouring, appearance and haptics. All on the device.",
  },
];

export default function AppPrivacyPage() {
  return (
    <ReadingShell className="reading-info">
      <div className="space-y-14 md:space-y-20">
        <header className="mx-auto max-w-2xl text-center">
          <div aria-hidden className="text-sm tracking-[0.6em] text-gold">
            &#10022; &#10022; &#10022;
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-gold">
            IUoC for iPhone &amp; Android
          </p>
          {/* The page must SAY "Privacy Policy", in the body, prominently.
            Google Play removed the app on 23 August 2026 for exactly this:
            "Your privacy policy does not include an explicit label identifying
            it as a 'Privacy policy'." The words were only ever in the <title>
            metadata, and the one visible mention lower down refers to Apple's
            and Google's policies rather than this one — worse than silence to
            anything scanning for a label. The old h1 keeps its place as the
            thesis directly beneath. */}
          <h1 className="mt-3 font-serif text-4xl leading-[1.1] md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 font-serif text-2xl leading-tight text-foreground/90 md:text-3xl">
            The app collects nothing.
          </p>
          <p className="mx-auto mt-6 max-w-xl font-serif text-lg leading-relaxed text-foreground/80">
            No account, no analytics, no servers. Everything you do in the app
            stays on your phone. This page explains what that means in detail,
            and it is short because there is little to say.
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-foreground/50">
            Last updated {LAST_UPDATED}
          </p>
        </header>

        <section className="mx-auto max-w-2xl">
          <SectionHeading eyebrow="Chapter I" title="What we do not collect" />
          <dl className="space-y-8">
            {collected.map((item) => (
              <div key={item.title}>
                <dt className="font-serif text-xl">{item.title}</dt>
                <dd className="mt-2 leading-relaxed text-foreground/80">
                  {item.body}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mx-auto max-w-2xl">
          <SectionHeading
            eyebrow="Chapter II"
            title="What stays on your device"
            stars={2}
          />
          <dl className="space-y-8">
            {onDevice.map((item) => (
              <div key={item.title}>
                <dt className="font-serif text-xl">{item.title}</dt>
                <dd className="mt-2 leading-relaxed text-foreground/80">
                  {item.body}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mx-auto max-w-2xl">
          <SectionHeading
            eyebrow="Chapter III"
            title="Backup, if you turn it on"
            stars={3}
          />
          <div className="space-y-4 leading-relaxed text-foreground/80">
            <p>
              The app can back up your bookmarks and settings to{" "}
              <strong className="font-semibold text-foreground">
                your own iCloud or Google Drive
              </strong>
              . That backup goes from your device to your cloud account. It does
              not pass through us, and we cannot read it.
            </p>
            <p>
              Backup is optional and off until you enable it. Whatever it writes
              is governed by Apple&rsquo;s or Google&rsquo;s privacy policy,
              since it lives in their storage under your account. Delete it the
              way you delete anything else in your own cloud storage.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-2xl">
          <SectionHeading
            eyebrow="Chapter IV"
            title="Children, and everyone else"
            stars={4}
          />
          <div className="space-y-4 leading-relaxed text-foreground/80">
            <p>
              The app is suitable for all ages. Because it collects no personal
              information from anyone, it collects none from children either,
              and there is no mechanism by which it could.
            </p>
            <p>
              There are no ads, no in-app purchases and no third-party content
              loaded from the internet.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-2xl">
          <SectionHeading
            eyebrow="Chapter V"
            title="Changes, and how to reach us"
            stars={5}
          />
          <div className="space-y-4 leading-relaxed text-foreground/80">
            <p>
              If a future version of the app collects anything at all, this page
              will say so before that version ships, and the date above will
              change.
            </p>
            <p>
              Questions about this policy can go through the{" "}
              <Link
                className="underline underline-offset-4 hover:text-gold"
                href="/support"
              >
                contact details on our support page
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </ReadingShell>
  );
}
