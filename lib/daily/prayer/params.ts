import { CalculationMethod, CalculationParameters, Madhab } from "adhan";

/**
 * Turning the reader's choices into `adhan` calculation parameters.
 *
 * Three independent axes, which people routinely conflate:
 *
 * 1. **School** decides Maghrib. Sunni Maghrib is at sunset; Ja'fari delays it
 *    until the sun is a few degrees below the horizon (`maghribAngle`). This is
 *    the only structural difference between them in the times themselves.
 * 2. **Asr** decides Asr, and nothing else. The shadow of an object must exceed
 *    its noon shadow by 1x its height (Shafi'i, Maliki, Hanbali) or 2x
 *    (Hanafi) — so Hanafi Asr lands 30-70 minutes later depending on season and
 *    latitude.
 * 3. **Method** decides Fajr and Isha, and is regional rather than doctrinal.
 *    ISNA's 15 degrees and Karachi's 18 are both used by Sunnis of every
 *    madhab. Getting this wrong is the most visible error available here, which
 *    is why it is a first-class setting and not an assumption.
 */

export type School = "sunni" | "shia";

/** `standard` is the majority position (Shafi'i, Maliki, Hanbali). */
export type Asr = "standard" | "hanafi";

export type PrayerKey =
  | "fajr"
  | "sunrise"
  | "dhuhr"
  | "asr"
  | "maghrib"
  | "isha";

export type Offsets = Record<PrayerKey, number>;

export const NO_OFFSETS: Offsets = {
  fajr: 0,
  sunrise: 0,
  dhuhr: 0,
  asr: 0,
  maghrib: 0,
  isha: 0,
};

export type MethodId =
  | "NorthAmerica"
  | "MuslimWorldLeague"
  | "Egyptian"
  | "Karachi"
  | "UmmAlQura"
  | "Dubai"
  | "Qatar"
  | "Kuwait"
  | "Singapore"
  | "Turkey"
  | "MoonsightingCommittee"
  | "Tehran"
  | "LevaQom";

export type MethodInfo = {
  id: MethodId;
  name: string;
  /** What it is, in the terms someone choosing would actually use. */
  note: string;
  school: School;
};

/**
 * All but one are methods `adhan` ships, with angles the library sources.
 *
 * The exception is Leva (Qom), which `adhan` has no preset for. It was left out
 * originally on the grounds that shipping it would mean inventing angles — but
 * the angles turned out to be published, not invented, and leaving it out was
 * the bigger error: Tehran's 17.7° is among the earliest Fajr angles in use, so
 * a Ja'fari reader whose community follows Leva got a Fajr thirteen minutes
 * early at Ottawa's latitude and no way to correct it but a manual offset.
 * That is exactly what the owner hit on 2026-08-23.
 *
 * Sourced twice before shipping: praytimes.org's conventions table gives "Leva
 * Research Institute, Qum — Fajr 16, Isha 14", and the reference app the owner
 * uses labels the same method "Shia Ithna Ashari (Jafari) · Fajr: 16° - Isha:
 * 14°". Both agree.
 */
export const METHODS: readonly MethodInfo[] = [
  {
    id: "NorthAmerica",
    name: "ISNA",
    note: "North America · 15° / 15°",
    school: "sunni",
  },
  {
    id: "MuslimWorldLeague",
    name: "Muslim World League",
    note: "Europe and worldwide · 18° / 17°",
    school: "sunni",
  },
  {
    id: "Egyptian",
    name: "Egyptian General Authority",
    note: "Egypt, Africa · 19.5° / 17.5°",
    school: "sunni",
  },
  {
    id: "Karachi",
    name: "University of Karachi",
    note: "Pakistan, India, Bangladesh · 18° / 18°",
    school: "sunni",
  },
  {
    id: "UmmAlQura",
    name: "Umm al-Qura",
    note: "Saudi Arabia · 18.5°, Isha 90 min after Maghrib",
    school: "sunni",
  },
  { id: "Dubai", name: "Dubai", note: "UAE · 18.2° / 18.2°", school: "sunni" },
  {
    id: "Qatar",
    name: "Qatar",
    note: "Qatar · 18°, Isha +90 min",
    school: "sunni",
  },
  {
    id: "Kuwait",
    name: "Kuwait",
    note: "Kuwait · 18° / 17.5°",
    school: "sunni",
  },
  {
    id: "Singapore",
    name: "Singapore",
    note: "Singapore, Malaysia · 20° / 18°",
    school: "sunni",
  },
  {
    id: "Turkey",
    name: "Diyanet",
    note: "Turkey · 18° / 17°",
    school: "sunni",
  },
  {
    id: "MoonsightingCommittee",
    name: "Moonsighting Committee",
    note: "Seasonal adjustment for high latitudes",
    school: "sunni",
  },
  {
    id: "LevaQom",
    name: "Shia Ithna-Ashari (Leva, Qom)",
    note: "Ja'fari · 16° / 14°, Maghrib 4° after sunset",
    school: "shia",
  },
  {
    id: "Tehran",
    name: "Institute of Geophysics, Tehran",
    note: "Ja'fari · 17.7° / 14°, Maghrib 4.5° after sunset",
    school: "shia",
  },
];

export function methodsFor(school: School): readonly MethodInfo[] {
  return METHODS.filter((m) => m.school === school);
}

export function methodInfo(id: MethodId): MethodInfo | undefined {
  return METHODS.find((m) => m.id === id);
}

export type PrayerConfig = {
  school: School;
  method: MethodId;
  asr: Asr;
  offsets: Offsets;
};

export function buildParams(config: PrayerConfig): CalculationParameters {
  // A method belonging to the other school would silently produce the wrong
  // Maghrib — Tehran's 4.5° angle under a Sunni selection, or a sunset Maghrib
  // under a Ja'fari one. Fall back rather than trust the stored pair.
  const allowed = methodsFor(config.school);
  const id = allowed.some((m) => m.id === config.method)
    ? config.method
    : (allowed[0]?.id ?? "MuslimWorldLeague");

  // Leva is built by hand because `adhan` ships no preset for it. Fajr 16 and
  // Isha 14 are confirmed from two independent sources (see METHODS above).
  // Maghrib 4° comes from the same convention row; it was NOT separately
  // re-verified, and it matters far less than Fajr — a degree of Maghrib angle
  // is a minute or two, where a degree of Fajr is four or five. Ja'fari Maghrib
  // is an angle rather than plain sunset either way, which is the part that
  // would be wrong to get wrong.
  const params =
    id === "LevaQom"
      ? Object.assign(new CalculationParameters("Other", 16, 14), {
          maghribAngle: 4,
        })
      : CalculationMethod[id]();
  params.madhab = config.asr === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;

  // `adjustments` is the reader's own correction, in minutes. It is a separate
  // field from `methodAdjustments`, which the preset owns — writing to that one
  // would silently discard the method's own corrections.
  params.adjustments = { ...config.offsets };

  return params;
}
