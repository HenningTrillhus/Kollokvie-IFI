export type EventType = "exam" | "deadline" | "other";

export type CalendarEvent = {
  id: string;
  user_id: string;
  title: string;
  event_date: string;
  type: EventType;
  created_at: string;
};

export const EVENT_TYPE_KEYS = {
  exam: "cal.exam",
  deadline: "cal.deadline",
  other: "cal.other",
} as const;

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  exam: "#dc2626",
  deadline: "#d97706",
  other: "#3f6f5e",
};

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
