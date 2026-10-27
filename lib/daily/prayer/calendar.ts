/** Calendar date at the selected location, independent of the browser's zone. */
export function dateInZone(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
/** Adhan consumes LOCAL calendar fields and returns UTC prayer instants. */
export function calendarDate(value: string, days = 0) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d + days, 12);
}
