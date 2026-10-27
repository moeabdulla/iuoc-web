import type { MethodId, School } from "./params";

/**
 * The calculation method a location most likely wants, before the reader has
 * chosen one.
 *
 * This is a default, not a determination. It exists because the alternative —
 * one fixed method for everyone — gives visibly wrong Fajr and Isha to anyone
 * outside that region, and the reader has no way of knowing that a setting is
 * why. The boxes below are deliberately coarse: a wrong guess is one tap to
 * fix, and pretending to more precision than a bounding box has would be worse.
 */

type Box = {
  method: MethodId;
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
};

/** First match wins, so the narrower boxes come first. */
const BOXES: readonly Box[] = [
  // Saudi Arabia.
  { method: "UmmAlQura", minLat: 16, maxLat: 33, minLon: 34, maxLon: 56 },
  // UAE.
  { method: "Dubai", minLat: 22, maxLat: 27, minLon: 51, maxLon: 57 },
  // Qatar.
  { method: "Qatar", minLat: 24, maxLat: 27, minLon: 50, maxLon: 52 },
  // Kuwait.
  { method: "Kuwait", minLat: 28, maxLat: 31, minLon: 46, maxLon: 49 },
  // Egypt and north-east Africa.
  { method: "Egyptian", minLat: 21, maxLat: 32, minLon: 24, maxLon: 37 },
  // Turkey.
  { method: "Turkey", minLat: 35, maxLat: 43, minLon: 25, maxLon: 45 },
  // Pakistan, India, Bangladesh, Afghanistan.
  { method: "Karachi", minLat: 5, maxLat: 38, minLon: 60, maxLon: 93 },
  // Malaysia, Singapore, Indonesia.
  { method: "Singapore", minLat: -11, maxLat: 8, minLon: 94, maxLon: 142 },
  // North America. IUoC is Canadian, so this is the common case.
  { method: "NorthAmerica", minLat: 14, maxLat: 72, minLon: -170, maxLon: -52 },
];

/**
 * Everywhere else — Europe, most of Africa, Central Asia, South America,
 * Oceania. Muslim World League is the usual choice when nothing more local
 * applies.
 */
const FALLBACK: MethodId = "MuslimWorldLeague";

export function defaultMethod(
  school: School,
  coords: { latitude: number; longitude: number } | null,
): MethodId {
  // Tehran is the only Ja'fari method `adhan` ships, so there is nothing to
  // choose between.
  if (school === "shia") return "Tehran";
  if (!coords) return FALLBACK;

  const { latitude: lat, longitude: lon } = coords;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return FALLBACK;

  for (const b of BOXES) {
    if (
      lat >= b.minLat &&
      lat <= b.maxLat &&
      lon >= b.minLon &&
      lon <= b.maxLon
    ) {
      return b.method;
    }
  }
  return FALLBACK;
}
