import { TAJWEED_COLORS, type TajweedRule } from "./tajweed";

/**
 * Tajweed colours as a reader sees them: nine groups, not eighteen rules.
 *
 * The rule list is an implementation detail of the annotation data — five
 * separate kinds of idgham all print teal, and nobody wants to configure five
 * pickers to change one colour. These groups are the units the colouring
 * actually has, and they are what both the legend and the picker work in.
 *
 * The examples are pulled from the shipped text, not typed by hand: Arabic that
 * looks right can differ by a byte (shadda-before-vowel ordering, for one), and
 * a hand-typed example would be a claim about the mushaf that the mushaf did
 * not make. Each was taken from the shortest ayah carrying that rule.
 */

export type TajweedGroupId =
  | "qalqalah"
  | "ikhfa"
  | "ghunnah"
  | "idgham"
  | "iqlab"
  | "madd2"
  | "madd45"
  | "madd6"
  | "silent";

export type TajweedGroup = {
  id: TajweedGroupId;
  label: string;
  /** What the reader is being told to do. Plain words, no jargon stacking. */
  description: string;
  /** Real word from quran.db, with the ayah it came from. */
  example: string;
  exampleRef: string;
  rules: TajweedRule[];
};

export const TAJWEED_GROUPS: readonly TajweedGroup[] = [
  {
    id: "qalqalah",
    label: "Qalqalah",
    description: "A slight echo or bounce on a letter said without a vowel.",
    example: "مُدْهَآمَّتَانِ",
    exampleRef: "55:64",
    rules: ["qalqalah"],
  },
  {
    id: "ikhfa",
    label: "Ikhfa",
    description: "The letter is hidden — held lightly with a nasal sound.",
    example: "فَأَنذِرْ",
    exampleRef: "74:2",
    rules: ["ikhfa", "ikhfa_shafawi"],
  },
  {
    id: "ghunnah",
    label: "Ghunnah",
    description: "A nasal sound held for about two counts.",
    example: "ثُمَّ",
    exampleRef: "74:21",
    rules: ["ghunnah"],
  },
  {
    id: "idgham",
    label: "Idgham",
    description: "The letter merges into the one after it.",
    example: "جَزَآءً وِفَاقًا",
    exampleRef: "78:26",
    rules: [
      "idghaam_ghunnah",
      "idghaam_no_ghunnah",
      "idghaam_shafawi",
      "idghaam_mutajanisayn",
      "idghaam_mutaqaribayn",
    ],
  },
  {
    id: "iqlab",
    label: "Iqlab",
    description: "The letter turns into a meem sound.",
    example: "كِرَامٍۭ بَرَرَةٍ",
    exampleRef: "80:16",
    rules: ["iqlab"],
  },
  {
    id: "madd2",
    label: "Madd · 2 counts",
    description: "A natural stretch, held about two counts.",
    example: "هَـٰرُونَ",
    exampleRef: "20:30",
    rules: ["madd_2", "madd_246"],
  },
  {
    id: "madd45",
    label: "Madd · 4–5 counts",
    description: "A longer stretch before a hamza.",
    example: "جَزَآءً",
    exampleRef: "78:26",
    rules: ["madd_munfasil", "madd_muttasil"],
  },
  {
    id: "madd6",
    label: "Madd · 6 counts",
    description: "The longest stretch, held about six counts.",
    example: "عٓسٓقٓ",
    exampleRef: "42:2",
    rules: ["madd_6"],
  },
  {
    id: "silent",
    label: "Not pronounced",
    description: "Written but not said. Greyed rather than highlighted.",
    example: "ٱلنَّاسِ",
    exampleRef: "114:2",
    rules: ["hamzat_wasl", "lam_shamsiyyah", "silent"],
  },
];

/**
 * `light`/`dark` null means "leave it the colour of the surrounding text".
 *
 * Needed because the mushaf the owner reads does NOT colour the 2-count
 * natural madd — it leaves it as plain ink. Without this the closest we could
 * offer was grey, which is not the same statement: grey is what this app uses
 * for letters that are written but not pronounced, so painting natural madd
 * grey would actively teach the wrong thing.
 */
export type Swatch = {
  id: string;
  name: string;
  light: string | null;
  dark: string | null;
};

/**
 * The palette a reader chooses from.
 *
 * Fixed rather than a colour wheel, per the owner: "some preset colors so it's
 * not infinite options but basically just moving stuff around". Every entry
 * carries a light AND dark value, because a hue that reads well on paper is
 * usually too dark on a near-black page — letting someone pick a single colour
 * would break one of the two themes for them and look like our bug.
 */
export const SWATCHES: readonly Swatch[] = [
  { id: "red", name: "Red", light: "#D32F2F", dark: "#FF8A80" },
  { id: "magenta", name: "Magenta", light: "#C2185B", dark: "#F48FB1" },
  { id: "orange", name: "Orange", light: "#EF6C00", dark: "#FFB74D" },
  { id: "amber", name: "Amber", light: "#B58900", dark: "#FFD54F" },
  { id: "green", name: "Green", light: "#2E7D32", dark: "#A5D6A7" },
  { id: "teal", name: "Teal", light: "#00796B", dark: "#4DB6AC" },
  { id: "cyan", name: "Cyan", light: "#0097A7", dark: "#4DD0E1" },
  { id: "blue", name: "Blue", light: "#1976D2", dark: "#90CAF9" },
  { id: "indigo", name: "Indigo", light: "#303F9F", dark: "#9FA8DA" },
  { id: "purple", name: "Purple", light: "#5E35B1", dark: "#B39DDB" },
  { id: "brown", name: "Brown", light: "#6D4C41", dark: "#BCAAA4" },
  { id: "grey", name: "Grey", light: "#78909C", dark: "#90A4AE" },
  { id: "none", name: "No colour", light: null, dark: null },
];

/**
 * Defaults, read off the mushaf the owner actually uses (screenshot of
 * al-Baqarah 1-5, supplied 2026-08-22) rather than chosen here.
 *
 * Confident from that image: qalqalah blue (رَزَقْنَٰ, قَبْلِكَ), ikhfa green
 * (يُنفِقُونَ, أُنزِلَ), ghunnah orange (مِّمَّا, رَّبِّهِمْ), both long madds red
 * (الٓمٓ, بِمَآ, أُو۟لَٰٓئِكَ), unpronounced letters grey (the ٱ of ٱلْكِتَٰبُ, the
 * و۟ of أُو۟لَٰٓئِكَ), and the 2-count natural madd left as plain ink.
 *
 * NOT determinable from that image, and marked here so nobody later mistakes
 * them for observed: `idgham` and `iqlab`. Al-Baqarah 1-5 contains no clean
 * iqlab, and its one idgham sits against the orange ghunnah closely enough
 * that the two cannot be separated by eye. Both are left on the app's previous
 * hues until someone confirms them.
 */
export const DEFAULT_GROUP_SWATCH: Record<TajweedGroupId, string> = {
  qalqalah: "blue",
  ikhfa: "green",
  ghunnah: "orange",
  idgham: "teal",
  iqlab: "cyan",
  madd2: "none",
  madd45: "red",
  madd6: "red",
  silent: "grey",
};

export function swatch(id: string): Swatch {
  return SWATCHES.find((s) => s.id === id) ?? SWATCHES[0];
}

/**
 * Flattens a group→swatch choice back into the per-rule map the renderer wants.
 *
 * Unknown group ids and unknown swatch ids both fall through to the shipped
 * defaults rather than throwing: this map is restored from a backup that may
 * have been written by an older or newer build, and a reader whose colours came
 * back slightly wrong is a much better outcome than a reader whose Quran will
 * not render.
 */
export function resolveTajweedColors(
  choice: Partial<Record<TajweedGroupId, string>>,
): Record<TajweedRule, { light: string; dark: string } | null> {
  const out: Record<string, { light: string; dark: string } | null> = {
    ...TAJWEED_COLORS,
  };
  for (const group of TAJWEED_GROUPS) {
    const s = swatch(choice[group.id] ?? DEFAULT_GROUP_SWATCH[group.id]);
    const value =
      s.light === null || s.dark === null
        ? null
        : { light: s.light, dark: s.dark };
    for (const rule of group.rules) out[rule] = value;
  }
  return out as Record<TajweedRule, { light: string; dark: string } | null>;
}
