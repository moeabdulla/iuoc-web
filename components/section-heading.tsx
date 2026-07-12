import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  action?: { href: string; label: string };
  id?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  action,
  id,
}: SectionHeadingProps) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-border/60 pb-4 md:mb-10">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <span aria-hidden className="h-px w-6 bg-primary/60" />
            {eyebrow}
          </p>
        )}
        <h2
          id={id}
          className="font-serif text-3xl leading-none tracking-tight md:text-4xl"
        >
          {title}
        </h2>
      </div>

      {action && (
        <Link
          href={action.href}
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
        >
          {action.label}
          <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
