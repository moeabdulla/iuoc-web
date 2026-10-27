"use client";
import { useState, useSyncExternalStore } from "react";
import { MapPin } from "lucide-react";
import { useBrowserStorage } from "@/lib/daily/use-browser-storage";
import {
  METHODS,
  NO_OFFSETS,
  methodsFor,
  type PrayerConfig,
  type School,
  type MethodId,
  type Asr,
  type PrayerKey,
} from "@/lib/daily/prayer/params";
import { timesFor, PRAYER_NAMES, PRAYER_ORDER } from "@/lib/daily/prayer/times";
import { defaultMethod } from "@/lib/daily/prayer/region";
import { calendarDate, dateInZone } from "@/lib/daily/prayer/calendar";
const cities = [
  {
    id: "ottawa",
    name: "Ottawa",
    latitude: 45.4215,
    longitude: -75.6972,
    timeZone: "America/Toronto",
  },
  {
    id: "toronto",
    name: "Toronto",
    latitude: 43.6532,
    longitude: -79.3832,
    timeZone: "America/Toronto",
  },
  {
    id: "vancouver",
    name: "Vancouver",
    latitude: 49.2827,
    longitude: -123.1207,
    timeZone: "America/Vancouver",
  },
  {
    id: "london",
    name: "London",
    latitude: 51.5074,
    longitude: -0.1278,
    timeZone: "Europe/London",
  },
  {
    id: "makkah",
    name: "Makkah",
    latitude: 21.4225,
    longitude: 39.8262,
    timeZone: "Asia/Riyadh",
  },
  {
    id: "karachi",
    name: "Karachi",
    latitude: 24.8607,
    longitude: 67.0011,
    timeZone: "Asia/Karachi",
  },
];
type Place = (typeof cities)[number];
type Preferences = { place: Place; config: PrayerConfig };
const initial: Preferences = {
  place: cities[0],
  config: {
    school: "sunni",
    method: "NorthAmerica",
    asr: "standard",
    offsets: NO_OFFSETS,
  },
};
function subscribeMinute(fn: () => void) {
  const timer = setInterval(fn, 30000);
  window.addEventListener("focus", fn);
  return () => {
    clearInterval(timer);
    window.removeEventListener("focus", fn);
  };
}
function validZone(zone: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}
export function PrayerTool() {
  const [saved, save] = useBrowserStorage<Preferences>(
    "iuoc.prayer.v1",
    initial,
  );
  const prefs =
    saved?.place &&
    Number.isFinite(saved.place.latitude) &&
    Number.isFinite(saved.place.longitude) &&
    validZone(saved.place.timeZone) &&
    saved.config?.offsets &&
    METHODS.some((m) => m.id === saved.config.method)
      ? saved
      : initial;
  const { place, config } = prefs;
  const minute = useSyncExternalStore(
    subscribeMinute,
    () => Math.floor(Date.now() / 60000),
    () => 0,
  );
  const [chosenDate, setDate] = useState("");
  const [locationStatus, setLocationStatus] = useState("");
  const now = new Date(minute * 60000),
    today = minute ? dateInZone(now, place.timeZone) : "";
  const date = chosenDate || today;
  const timings = date ? timesFor(place, calendarDate(date), config) : [];
  const next =
    date === today
      ? (timings.find((t) => t.key !== "sunrise" && t.at > now) ??
        timesFor(place, calendarDate(date, 1), config).find(
          (t) => t.key === "fajr",
        ))
      : undefined;
  const formatter = new Intl.DateTimeFormat(undefined, {
    timeZone: place.timeZone,
    hour: "numeric",
    minute: "2-digit",
  });
  function setConfig(update: Partial<PrayerConfig>) {
    save({ ...prefs, config: { ...config, ...update } });
  }
  function setSchool(school: School) {
    setConfig({ school, method: defaultMethod(school, place) });
  }
  function setPlace(nextPlace: Place) {
    save({
      place: nextPlace,
      config: { ...config, method: defaultMethod(config.school, nextPlace) },
    });
    setDate("");
    setLocationStatus("");
  }
  function locate() {
    if (!navigator.geolocation) {
      setLocationStatus("Location is unavailable. Choose a city instead.");
      return;
    }
    setLocationStatus("Requesting your location…");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPlace({
          id: "device",
          name: "Your location",
          latitude: p.coords.latitude,
          longitude: p.coords.longitude,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
        setLocationStatus("Location saved in this browser only.");
      },
      () =>
        setLocationStatus("Location was not available. Choose a city instead."),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 },
    );
  }
  const activeMethod = METHODS.find((m) => m.id === config.method);
  return (
    <>
      <p className="daily-intro">
        Prayer times for your selected location. Choose the calculation method
        used by your community.
      </p>
      <div className="daily-controls">
        <label>
          City
          <select
            aria-label="City"
            value={place.id}
            onChange={(e) => {
              const city = cities.find((c) => c.id === e.target.value);
              if (city) setPlace(city);
            }}
          >
            {!cities.some((c) => c.id === place.id) && (
              <option value={place.id}>
                {place.id === "custom" ? "Saved location" : place.name}
              </option>
            )}
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
      </div>
      <div className="prayer-location-action">
        <button className="daily-action" onClick={locate}>
          <MapPin size={17} /> Use my location
        </button>
        <p>Optional. Your location stays in this browser.</p>
      </div>
      {locationStatus && (
        <p className="daily-muted" role="status">
          {locationStatus}
        </p>
      )}
      <div className="prayer-current-location" aria-live="polite">
        <MapPin size={24} aria-hidden="true" />
        <div>
          <span className="daily-eyebrow">Prayer times in</span>
          <h2>{place.id === "custom" ? "Saved location" : place.name}</h2>
          <p className="daily-muted">
            {place.timeZone.replaceAll("_", " ").replaceAll("/", " / ")}
          </p>
        </div>
      </div>
      {!minute ? (
        <p role="status">Loading today’s times…</p>
      ) : (
        <>
          <table className="prayer-table">
            <caption className="sr-only">
              Prayer times for {place.name} on {date}
            </caption>
            <tbody>
              {timings.map((t) => (
                <tr
                  key={t.key}
                  data-next={
                    t.key === next?.key &&
                    dateInZone(next.at, place.timeZone) === date
                  }
                >
                  <td>{PRAYER_NAMES[t.key]}</td>
                  <td>
                    {Number.isFinite(t.at.getTime())
                      ? formatter.format(t.at)
                      : "Unavailable"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {next && dateInZone(next.at, place.timeZone) !== date && (
            <p className="daily-muted">
              Next: Fajr tomorrow at {formatter.format(next.at)}.
            </p>
          )}
        </>
      )}
      <p className="daily-muted">
        {activeMethod?.name} · {config.school === "shia" ? "Ja’fari" : "Sunni"}{" "}
        · {config.asr === "hanafi" ? "Hanafi Asr" : "Standard Asr"}
      </p>
      <details className="prayer-settings">
        <summary>Calculation settings</summary>
        <div className="daily-controls">
          <label>
            School
            <select
              aria-label="School"
              value={config.school}
              onChange={(e) => setSchool(e.target.value as School)}
            >
              <option value="sunni">Sunni</option>
              <option value="shia">Ja’fari (Shia)</option>
            </select>
          </label>
          <label>
            Method
            <select
              aria-label="Method"
              value={config.method}
              onChange={(e) =>
                setConfig({ method: e.target.value as MethodId })
              }
            >
              {methodsFor(config.school).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Asr
            <select
              aria-label="Asr"
              value={config.asr}
              onChange={(e) => setConfig({ asr: e.target.value as Asr })}
            >
              <option value="standard">Standard</option>
              <option value="hanafi">Hanafi</option>
            </select>
          </label>
        </div>
        <p className="daily-muted">{activeMethod?.note}</p>
        <h2 className="courtyard-subheading" style={{ marginTop: 25 }}>
          Minute adjustments
        </h2>
        <div className="daily-controls prayer-offsets">
          {PRAYER_ORDER.map((key) => (
            <label key={key}>
              {PRAYER_NAMES[key]}
              <input
                type="number"
                min={-120}
                max={120}
                step={1}
                value={config.offsets[key]}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (Number.isFinite(value))
                    setConfig({
                      offsets: {
                        ...config.offsets,
                        [key as PrayerKey]: Math.max(
                          -120,
                          Math.min(120, Math.round(value)),
                        ),
                      },
                    });
                }}
              />
            </label>
          ))}
        </div>
        <button
          className="daily-link"
          onClick={() => setConfig({ offsets: NO_OFFSETS })}
        >
          Reset adjustments
        </button>
      </details>
      <p className="daily-sources">
        Calculated on your device with Adhan, using the same parameters as the
        IUoC app. These are calculated prayer start times, rather than a
        mosque’s congregation schedule.
      </p>
    </>
  );
}
