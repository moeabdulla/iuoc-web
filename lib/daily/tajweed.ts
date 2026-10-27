/**
 * Tajweed colouring — an opt-in reading aid.
 *
 * The annotations shipped in quran.db are ALGORITHMIC, from cpfair/quran-tajweed
 * (CC BY 4.0), regenerated against our exact text. They are not scholar-verified,
 * and the UI must present this as an aid rather than an authority.
 *
 * Hues follow the convention used by colour-coded mushafs — qalqalah red, ikhfa
 * magenta, ghunnah orange, idgham teal, madd blue, iqlab cyan, silent grey — so
 * a reader who learned from a printed mushaf recognises them. Exact values vary
 * by publisher; these are tuned for contrast on both themes rather than copied
 * from any one printing.
 */

export type TajweedRule =
  | "hamzat_wasl"
  | "silent"
  | "lam_shamsiyyah"
  | "madd_2"
  | "madd_246"
  | "madd_6"
  | "madd_munfasil"
  | "madd_muttasil"
  | "ghunnah"
  | "ikhfa"
  | "ikhfa_shafawi"
  | "idghaam_ghunnah"
  | "idghaam_no_ghunnah"
  | "idghaam_shafawi"
  | "idghaam_mutajanisayn"
  | "idghaam_mutaqaribayn"
  | "iqlab"
  | "qalqalah";

export type TajweedSpan = { start: number; end: number; rule: TajweedRule };
export type TajweedRun = { text: string; rule: TajweedRule | null };

/**
 * Colour per rule, per theme.
 *
 * Light values are saturated enough to read as deliberately coloured against
 * near-black ink on paper — the first pass used muted, low-contrast tones that
 * were hard to distinguish from the body text.
 *
 * Grey for `silent` and `hamzat_wasl` is intentional and matches printed
 * mushafs: those letters are written but NOT pronounced, so they are
 * de-emphasised rather than highlighted. They are darkened here so "quiet"
 * still means legible.
 */
export const TAJWEED_COLORS: Record<
  TajweedRule,
  { light: string; dark: string }
> = {
  qalqalah: { light: "#D32F2F", dark: "#FF8A80" },
  ikhfa: { light: "#C2185B", dark: "#F48FB1" },
  ikhfa_shafawi: { light: "#C2185B", dark: "#F48FB1" },
  ghunnah: { light: "#EF6C00", dark: "#FFB74D" },
  idghaam_ghunnah: { light: "#00796B", dark: "#4DB6AC" },
  idghaam_no_ghunnah: { light: "#00796B", dark: "#4DB6AC" },
  idghaam_shafawi: { light: "#00796B", dark: "#4DB6AC" },
  idghaam_mutajanisayn: { light: "#00796B", dark: "#4DB6AC" },
  idghaam_mutaqaribayn: { light: "#00796B", dark: "#4DB6AC" },
  iqlab: { light: "#0097A7", dark: "#4DD0E1" },
  madd_2: { light: "#1976D2", dark: "#90CAF9" },
  madd_246: { light: "#1976D2", dark: "#90CAF9" },
  madd_munfasil: { light: "#5E35B1", dark: "#B39DDB" },
  madd_muttasil: { light: "#5E35B1", dark: "#B39DDB" },
  madd_6: { light: "#303F9F", dark: "#9FA8DA" },
  hamzat_wasl: { light: "#78909C", dark: "#90A4AE" },
  lam_shamsiyyah: { light: "#78909C", dark: "#90A4AE" },
  silent: { light: "#78909C", dark: "#78909C" },
};

/**
 * When two rules cover the same character the more specific one wins. In
 * practice this is rare — 43 overlaps across the whole mushaf — and almost
 * always a broad `ghunnah` sitting under a specific idghaam/ikhfa/iqlab, which
 * is exactly the case this ordering resolves.
 */
const PRIORITY: TajweedRule[] = [
  "ghunnah",
  "silent",
  "hamzat_wasl",
  "lam_shamsiyyah",
  "madd_2",
  "madd_246",
  "madd_6",
  "madd_munfasil",
  "madd_muttasil",
  "qalqalah",
  "ikhfa",
  "ikhfa_shafawi",
  "iqlab",
  "idghaam_ghunnah",
  "idghaam_no_ghunnah",
  "idghaam_shafawi",
  "idghaam_mutajanisayn",
  "idghaam_mutaqaribayn",
];
const RANK = new Map(PRIORITY.map((r, i) => [r, i]));

/**
 * Splits an ayah into coloured runs. Works on CODE POINTS, not UTF-16 units —
 * the annotation offsets are code-point indices, and Arabic text is full of
 * characters where the two disagree.
 */
export function toRuns(text: string, spans: TajweedSpan[]): TajweedRun[] {
  const chars = [...text];
  const owner: (TajweedRule | null)[] = new Array(chars.length).fill(null);

  for (const s of spans) {
    const rank = RANK.get(s.rule) ?? -1;
    for (let i = Math.max(0, s.start); i < Math.min(s.end, chars.length); i++) {
      const held = owner[i];
      if (held === null || rank > (RANK.get(held) ?? -1)) owner[i] = s.rule;
    }
  }

  const runs: TajweedRun[] = [];
  for (let i = 0; i < chars.length; i++) {
    const rule = owner[i];
    const last = runs[runs.length - 1];
    if (last && last.rule === rule) last.text += chars[i];
    else runs.push({ text: chars[i], rule });
  }
  return runs;
}

/**
 * Re-base spans onto the verse after a Basmala header is split off. Spans
 * entirely before the cut belong to the header; the rest shift down by it.
 *
 * The build asserts no span straddles the cut, so nothing is dropped here — a
 * rule that spanned the boundary would mean the boundary is in the wrong place,
 * which is a build failure rather than something to paper over at render time.
 */
export function spansAfter(spans: TajweedSpan[], cut: number): TajweedSpan[] {
  if (cut <= 0) return spans;
  return spans
    .filter((s) => s.start >= cut)
    .map((s) => ({ ...s, start: s.start - cut, end: s.end - cut }));
}

export function spansBefore(spans: TajweedSpan[], cut: number): TajweedSpan[] {
  if (cut <= 0) return [];
  return spans.filter((s) => s.end <= cut);
}
