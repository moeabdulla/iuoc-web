import Link from "next/link";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  action?: { href: string; label: string };
  id?: string;
};

// Chapter heading: a small-caps number line, a centered serif title, and a
// gold ornament — the printed-book convention that replaces eyebrow chips.
// API is unchanged; `eyebrow` now reads as the chapter/section line.
export function SectionHeading({
  eyebrow,
  title,
  action,
  id,
}: SectionHeadingProps) {
  return (
    <div className="mb-10 border-t border-border pt-8 text-center md:mb-12">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
          {eyebrow}
        </p>
      )}
      <h2
        id={id}
        className="mt-2 font-serif text-3xl leading-tight md:text-4xl"
      >
        {title}
      </h2>
      <div
        aria-hidden
        className="mt-3 text-sm tracking-[0.5em] text-gold"
      >
        &#10087;
      </div>

      {action && (
        <Link
          href={action.href}
          className="mt-4 inline-block font-serif text-sm italic text-primary underline-offset-4 transition-colors hover:underline"
        >
          &mdash; {action.label} &mdash;
        </Link>
      )}
    </div>
  );
}
