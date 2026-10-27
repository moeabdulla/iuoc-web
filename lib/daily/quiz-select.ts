/**
 * Which question today is.
 *
 * The whole appeal of a daily question is that it is the SAME question for
 * everyone — "did you do today's one yet" only works if there is a single
 * today's one. That is why selection depends on the date and nothing else: not
 * on what this reader has already seen, not on a server, not on install order.
 * Two people on opposite sides of the country open the app and get the same
 * question, offline, with no account between them.
 *
 * The cost of that is real and worth naming: we cannot skip questions a reader
 * has already answered, because doing so would make their sequence personal and
 * break the shared property. Once the bank is exhausted it begins again, and
 * the fix for that is more questions, not cleverer selection.
 */

export type QuizCategory =
  | "quran-story"
  | "quran-teaching"
  | "seerah"
  | "tajweed";

export type QuizQuestion = {
  id: string;
  category: QuizCategory;
  prompt: string;
  options: string[];
  answer: number;
  hint?: string;
  sura?: number;
  aya?: number;
  video?: string;
  basis?: string;
};

/**
 * Days since the epoch **in the reader's own timezone**.
 *
 * Built from the local Y/M/D rather than by subtracting a UTC offset, because
 * the offset changes under daylight saving and the arithmetic version can put
 * two consecutive local days on the same number the morning the clocks move.
 * Composing a UTC timestamp out of local calendar fields cannot drift.
 */
export function localDayNumber(now: Date): number {
  return Math.floor(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000,
  );
}

/** `2026-08-22` in local time. The primary key of a day's play. */
export function dayKey(now: Date): string {
  const m = `${now.getMonth() + 1}`.padStart(2, "0");
  const d = `${now.getDate()}`.padStart(2, "0");
  return `${now.getFullYear()}-${m}-${d}`;
}

/** mulberry32 — small, fast, and identical on every device, which is the point. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function hash(s: string): number {
  let h = 2_166_136_261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16_777_619);
  }
  return h >>> 0;
}

function shuffled<T>(items: readonly T[], seed: number): T[] {
  const out = [...items];
  const next = rng(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * The order the bank is served in for one full pass.
 *
 * Not a plain shuffle. A plain shuffle of 34 narrative, 30 teaching and 17
 * seerah questions will happily deal four narrative ones in a row, and a reader
 * who meets the same flavour four mornings running concludes that is all the
 * app has. So each category is shuffled on its own and then spread evenly
 * across the pass: an item that is jth of n in its category is placed at
 * (j + 0.5) / n through the order. Sorting by that position interleaves the
 * categories in proportion to their size, which is the property we actually
 * want — variety every day, not merely randomness overall.
 */
export function orderFor(bank: readonly QuizQuestion[]): QuizQuestion[] {
  const buckets = new Map<string, QuizQuestion[]>();
  for (const q of bank) {
    const b = buckets.get(q.category);
    if (b) b.push(q);
    else buckets.set(q.category, [q]);
  }

  const placed: { q: QuizQuestion; at: number }[] = [];
  for (const [category, items] of buckets) {
    const order = shuffled(items, hash(category));
    order.forEach((q, j) => {
      placed.push({ q, at: (j + 0.5) / order.length });
    });
  }

  // Ties are broken by a seeded hash rather than by insertion order, so two
  // categories of equal size do not lock into the same alternating pattern
  // every cycle.
  return placed
    .sort(
      (a, b) =>
        a.at - b.at ||
        hash(a.q.id) - hash(b.q.id) ||
        (a.q.id < b.q.id ? -1 : 1),
    )
    .map((p) => p.q);
}

/**
 * Today's question, or null for an empty bank.
 *
 * One fixed order, walked forever. The first version reshuffled the bank each
 * time it was exhausted, which sounds better and is worse: a reader who crosses
 * a boundary gets the tail of one shuffle followed by the head of an unrelated
 * one, and the two overlap by chance. Over 81 days that returned 65 distinct
 * questions rather than 81.
 *
 * With a single permutation, ANY 81 consecutive days contain all 81 questions
 * exactly once, whichever day a reader happens to start on. The price is that
 * the second pass repeats the first pass's order — which nobody will notice
 * eleven weeks later, and which growing the bank disturbs anyway.
 */
export function questionFor(
  bank: readonly QuizQuestion[],
  now: Date,
): QuizQuestion | null {
  if (bank.length === 0) return null;
  const day = localDayNumber(now);
  const slot = ((day % bank.length) + bank.length) % bank.length;
  const picked = orderFor(bank)[slot];
  return picked ? withShuffledOptions(picked) : null;
}

/**
 * The options in the order the reader actually sees them.
 *
 * Every question in the bank is authored with its correct option first, which
 * is the only sane way to write them and was shipped exactly as authored: all
 * 81 had `answer: 0`, so the right choice was the top row every single day and
 * the game could be won forever by never reading it.
 *
 * Seeded from the question id, so the order is fixed for that question and
 * identical on every device. That is not a detail — the whole premise is that
 * everyone gets the same question on the same day, and two readers comparing
 * notes must be looking at the same four rows in the same order.
 *
 * Deliberately NOT seeded with the date as well. Re-ordering the same question
 * on a later pass would move the answer under a reader who had already seen it,
 * and the bank repeating after 81 days is a documented, accepted property.
 */
export function withShuffledOptions(q: QuizQuestion): QuizQuestion {
  const order = shuffled(
    q.options.map((_, i) => i),
    hash(`${q.id}:options`),
  );
  return {
    ...q,
    options: order.map((i) => q.options[i] as string),
    answer: order.indexOf(q.answer),
  };
}

/**
 * The number shown after the reveal, e.g. "Quiz #47".
 *
 * Counts from the bank's first day rather than from the reader's first day, so
 * it is the same number on everyone's screen — the same reason the question is.
 */
export function quizNumber(bank: readonly QuizQuestion[], now: Date): number {
  if (bank.length === 0) return 0;
  return localDayNumber(now) - EPOCH_DAY + 1;
}

/** 2026-01-01, local. Fixed forever; changing it renumbers everyone's history. */
const EPOCH_DAY = Math.floor(Date.UTC(2026, 0, 1) / 86_400_000);
