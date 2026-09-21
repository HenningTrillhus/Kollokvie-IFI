// "deadline" is shown as "Oblig" (assignment); the stored value stays the same.
export type EventType = "exam" | "deadline" | "other";

export type CalendarEvent = {
  id: string;
  user_id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  course_code: string | null;
  type: EventType;
  created_at: string;
};

export const EVENT_TYPES: EventType[] = ["exam", "deadline", "other"];

export const EVENT_TYPE_KEYS = {
  exam: "cal.exam",
  deadline: "cal.oblig",
  other: "cal.other",
} as const;

export function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

// 0 = Monday .. 6 = Sunday
export function firstWeekdayMondayIndex(year: number, month: number) {
  const jsDay = new Date(year, month, 1).getDay();
  return (jsDay + 6) % 7;
}

export function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// "14:30:00" -> "14:30"
export function shortTime(time: string | null | undefined) {
  return time ? time.slice(0, 5) : null;
}

// Whole days from `fromKey` to `dateKey` (both "YYYY-MM-DD"); negative if past.
export function daysUntil(dateKey: string, fromKey: string) {
  const [y1, m1, d1] = dateKey.split("-").map(Number);
  const [y2, m2, d2] = fromKey.split("-").map(Number);
  return Math.round((Date.UTC(y1, m1 - 1, d1) - Date.UTC(y2, m2 - 1, d2)) / 86400000);
}
