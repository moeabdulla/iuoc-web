import { ConvexError } from "convex/values";

/** A number validator also accepts NaN/Infinity; database reads need integers. */
export function boundedInteger(
  value: number,
  maximum: number,
  minimum = 1,
): number {
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < minimum) {
    throw new ConvexError(`Expected a whole number of at least ${minimum}.`);
  }
  return Math.min(value, maximum);
}

export function boundedText(value: string, maximum: number): string {
  if (value.length > maximum) {
    throw new ConvexError(`Text must be ${maximum} characters or fewer.`);
  }
  return value.trim();
}
