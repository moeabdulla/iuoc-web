import { Coordinates, PrayerTimes } from "adhan";

import { buildParams, type PrayerConfig, type PrayerKey } from "./params";

export type Timing = { key: PrayerKey; at: Date };

/** In order, as they occur. Sunrise is included: it marks the end of Fajr. */
export const PRAYER_ORDER: readonly PrayerKey[] = [
  "fajr",
  "sunrise",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

export const PRAYER_NAMES: Record<PrayerKey, string> = {
  fajr: "Fajr",
  sunrise: "Sunrise",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

export type Coords = { latitude: number; longitude: number };

export function timesFor(
  coords: Coords,
  date: Date,
  config: PrayerConfig,
): Timing[] {
  const times = new PrayerTimes(
    new Coordinates(coords.latitude, coords.longitude),
    date,
    buildParams(config),
  );
  return PRAYER_ORDER.map((key) => ({ key, at: times[key] }));
}

/**
 * The next prayer after `now`, looking into tomorrow when today is spent.
 *
 * Rolling into the next day matters more than it looks: after Isha, "next
 * prayer" is tomorrow's Fajr, and a version of this that only considered today
 * would show nothing for the several hours of the night when someone is most
 * likely to be checking what time Fajr is.
 */
export function nextPrayer(
  coords: Coords,
  now: Date,
  config: PrayerConfig,
): Timing | null {
  // Sunrise is a marker, not a prayer, so it is never "next".
  const upcoming = (d: Date) =>
    timesFor(coords, d, config).filter((t) => t.key !== "sunrise");

  const today = upcoming(now).find((t) => t.at.getTime() > now.getTime());
  if (today) return today;

  const tomorrow = new Date(now.getTime() + 86_400_000);
  return upcoming(tomorrow)[0] ?? null;
}

/**
 * Every prayer time from `now` up to `days` ahead, in order.
 *
 * Used to build the notification schedule. Times are recomputed per day rather
 * than extrapolated — they move by minutes daily, and by more than that around
 * the equinoxes.
 */
export function upcomingTimings(
  coords: Coords,
  now: Date,
  config: PrayerConfig,
  days: number,
): Timing[] {
  const out: Timing[] = [];
  for (let i = 0; i < days; i++) {
    const day = new Date(now.getTime() + i * 86_400_000);
    for (const t of timesFor(coords, day, config)) {
      if (t.at.getTime() > now.getTime()) out.push(t);
    }
  }
  return out.sort((a, b) => a.at.getTime() - b.at.getTime());
}
