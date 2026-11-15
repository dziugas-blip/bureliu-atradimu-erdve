import type { ScheduleSlot } from "./listings";

export const WEEKDAYS = [
  "Pirmadienis",
  "Antradienis",
  "Trečiadienis",
  "Ketvirtadienis",
  "Penktadienis",
  "Šeštadienis",
  "Sekmadienis",
] as const;
export type Weekday = (typeof WEEKDAYS)[number];

/** Start and end as "HH:MM", the format a time input produces. */
export interface DayTimes {
  from: string;
  to: string;
}
/** Only the days the activity runs on are present. */
export type WeekSchedule = Partial<Record<Weekday, DayTimes>>;

/** Times offered in the picker: every 15 minutes from 06:00 to 23:00. */
export const TIME_OPTIONS: readonly string[] = Array.from({ length: (23 - 6) * 4 + 1 }, (_, i) => {
  const minutes = 6 * 60 + i * 15;
  const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mm = String(minutes % 60).padStart(2, "0");
  return `${hh}:${mm}`;
});

export const DEFAULT_TIMES: DayTimes = { from: "17:00", to: "18:00" };

/** Days whose times are missing or end before they start. "HH:MM" strings compare correctly. */
export function invalidDays(week: WeekSchedule): Weekday[] {
  return WEEKDAYS.filter((day) => {
    const t = week[day];
    return t !== undefined && (!t.from || !t.to || t.from >= t.to);
  });
}

/**
 * The reverse of `toScheduleSlots`, for loading a saved listing back into the form.
 * Rows that are not a known weekday with a "HH:MM – HH:MM" time are skipped.
 */
export function fromScheduleSlots(slots: readonly ScheduleSlot[]): WeekSchedule {
  const week: WeekSchedule = {};
  for (const slot of slots) {
    const day = WEEKDAYS.find((d) => d === slot.day);
    const match = /^(\d{2}:\d{2})\s*[–-]\s*(\d{2}:\d{2})$/.exec(slot.time.trim());
    if (day && match?.[1] && match[2]) week[day] = { from: match[1], to: match[2] };
  }
  return week;
}

/** Listing schedule rows, always Monday first whatever order the days were ticked in. */
export function toScheduleSlots(week: WeekSchedule): ScheduleSlot[] {
  return WEEKDAYS.flatMap((day) => {
    const t = week[day];
    return t ? [{ day, time: `${t.from} – ${t.to}` }] : [];
  });
}
