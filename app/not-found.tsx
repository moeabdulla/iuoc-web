import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ReadingShell } from "@/components/courtyard/reading-shell";

export default function NotFound() {
  return (
    <ReadingShell className="reading-info">
      <div className="mx-auto max-w-xl py-8 text-center">
        <p className="mb-5 text-sm tracking-[.3em] text-gold">404</p>
        <h1>Page not found</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          This page may have moved. You can continue exploring the library.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <Link href="/videos" className="courtyard-button">
            The library <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link href="/" className="courtyard-text-link">
            <ArrowLeft size={18} aria-hidden="true" /> Home
          </Link>
        </div>
      </div>
    </ReadingShell>
  );
}
