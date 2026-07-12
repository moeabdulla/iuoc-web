import Link from "next/link";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  action?: { href: string; label: string };
  id?: string;
  // The gold ornament renders this many ✦ glyphs so a chapter's stars count
  // the chapter (Chapter I → one, Chapter II → two…). Defaults to one for
  // non-chapter headings; clamped to 4 to keep the rule visually sane.
  stars?: number;
};

// Chapter heading: a small-caps number line, a centered serif title, and a
// gold ornament — the printed-book convention that replaces eyebrow chips.
// `eyebrow` reads as the chapter/section line.
export function SectionHeading({
  eyebrow,
  title,
  action,
  id,
  stars = 1,
}: SectionHeadingProps) {
  const starCount = Math.min(Math.max(Math.round(stars), 1), 4);

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
        className="mt-4 flex items-center justify-center gap-3 text-gold"
      >
        <span className="h-px w-8 bg-current opacity-70" />
        <span className="flex items-center gap-2.5 text-xl leading-none">
          {Array.from({ length: starCount }, (_, i) => (
            <span key={i}>&#10022;</span>
          ))}
        </span>
        <span className="h-px w-8 bg-current opacity-70" />
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
