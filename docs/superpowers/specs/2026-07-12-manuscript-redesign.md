# Manuscript Redesign — Design Addendum

Date: 2026-07-12
Status: Direction approved by owner from mockup (scratchpad mockup-1-manuscript.html);
build out fully, tweak iteratively afterward.

## Direction

"Manuscript / Illuminated Print" — the site borrows the structural language of
Islamic book arts and fine letterpress printing. Not a costume: thin rules, one
ornament family, gold in small doses. Replaces the current generic-editorial skin.

Explicit owner feedback driving this:
- Previous look read as "AI-generated": eyebrow chips, gradient blobs, pill
  badges, uniform rounded cards, Fraunces. All of these go.
- Owner wants "unique life"; approved manuscript mockup and the illumination
  effect ("key words illuminate a color and glow cuz it's a holy kinda thing").
- Latest-videos section should feel smaller/tighter than current.

## Palette

Light ("day library"): paper #f5efe1, secondary paper #efe7d2, ink #22301f,
deep green #14563a, gold #a87d2a (accents only), madder red #96382b (rare, tiny).
Dark ("night library"): deep green-black paper (#101713-range), warm ivory ink,
same green/gold logic — gold reads BETTER on dark; keep it just as scarce.
Map through the existing shadcn HSL token system in globals.css (both themes).

## Typography

- Display/body serif with genuine bookish character via next/font/google —
  candidates: Source Serif 4 (workhorse) + optional accent use of Amiri for
  Arabic glyphs (﷽, ﷺ) so they render with proper calligraphic weight.
  Fraunces and Hanken Grotesk are retired. A humanist sans may remain ONLY for
  tiny UI labels if needed; prefer small-caps serif treatment instead.
- Italic serif for dates/asides (printed-book convention).

## Signature elements (from approved mockup)

1. **Title-page hero (home)**: ﷽ above; the hadith "Convey from me, even a
   single verse." as the headline; attribution line "— The Prophet Muhammad ﷺ";
   mission line as lede; two letterpress-style CTAs (solid green / outlined).
2. **The illumination**: once per load, a light sheen sweeps the hadith, then
   "Convey" and "a single verse" flare and settle into gold with a soft
   residual halo (approved intensity = mockup values). CSS-only, ~2.6s sweep +
   staggered word illumination; prefers-reduced-motion → words statically gold.
3. **Chapters**: numbered section headings ("Chapter the First — Latest
   Lectures"), centered, with small ornament (❧ / ✦). Replaces eyebrow chips.
4. **Plates**: video cards framed like book figures — double frame (ink outer,
   gold inner hairline), captions beneath: small-caps figure label, serif
   title, italic date. Shorts keep the fade-overlay treatment inside the frame.
5. **Table of contents**: series lists as TOC rows with dotted leaders and
   lecture counts (roman numerals as row markers).
6. **Colophon**: support/donation block as a bordered colophon with ✦ break in
   the top rule, centered, "Sadaqah Jariyah" in letterspaced small caps.
7. **Masthead/footer**: double-rule borders; footer italic, book-back-page tone.

## Per-page treatment

- **Home**: hero + chapters + plates + TOC + colophon per mockup. Latest
  section tightened: 1 lead plate + compact 2-col plates (fewer than current 12
  — 6-8 max), "view all" as italic TOC-style link.
- **/videos**: catalog framed as the library: chapter heading, series rails as
  shelf rows (keep scroll pagination), search styled as a catalog slip; plates
  for cards.
- **/series/[id]**: a chapter page: chapter-number header, description as
  printed foreword, plate grid.
- **/videos/[slug]**: the plate page: framed player (ink/gold double frame),
  title as chapter heading, metadata as italic printed caption, description in
  book paragraph style, related rail as "further reading" TOC.
- **/about**: printed foreword/preface layout.
- **/support**: full colophon page (cards as pledge slips; keep exact URLs).

## Hard constraints

- All existing functionality, routes, queries, SEO metadata, sitemap unchanged.
- Both themes; mobile-first at 390px; reduced-motion honored everywhere.
- No emojis in code; the maple leaf in the footer may be typographic (existing).
- Brand green stays the primary; gold is an accent, never body text color.
- No stock AI patterns: no eyebrow chips, no gradient blobs, no glassmorphism.
