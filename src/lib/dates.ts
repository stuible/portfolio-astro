const timeZone = "America/Vancouver";
const calendarDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const monthYearFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "UTC",
  month: "short",
  year: "numeric",
});
const fullDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "UTC",
  month: "long",
  day: "numeric",
  year: "numeric",
});

// Date-only strings are calendar dates, not instants: parsing "2026-09-01" as
// UTC midnight and rendering it in Vancouver would report the previous day.
export const calendarParts = (
  date: string | Date
): [number, number, number] => {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split("-").map(Number);
    return [year, month, day];
  }

  const parts = calendarDateFormatter.formatToParts(new Date(date));
  const part = (type: string) =>
    Number(parts.find((entry) => entry.type === type)?.value);
  return [part("year"), part("month"), part("day")];
};

export const calendarDay = (date: string | Date): number => {
  const [year, month, day] = calendarParts(date);
  return Date.UTC(year, month - 1, day) / 86_400_000;
};

export const fullDate = (date: string): string => {
  const [year, month, day] = calendarParts(date);
  return fullDateFormatter.format(new Date(Date.UTC(year, month - 1, day)));
};

// Compares against "now" at call time, so results stay honest on both the
// server at build time and in the browser after hydration.
export const relativeTime = (date: string): string => {
  const days = Math.max(0, calendarDay(new Date()) - calendarDay(date));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const [year, month, day] = calendarParts(date);
  return monthYearFormatter.format(new Date(Date.UTC(year, month - 1, day)));
};
