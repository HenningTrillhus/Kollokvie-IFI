import { GROUPS_KEY, NO_COURSE_KEY, colorFor, isVisible, type Prefs } from "@/lib/calendar-prefs";
import { shortTime, type CalendarEvent, type EventType } from "@/lib/events";
import type { Group } from "@/lib/groups";

// One thing on the calendar: either the user's own event or a study group
// session, already resolved to a color and filtered by the course settings.
export type CalItem = {
  key: string;
  kind: "event" | "group";
  id: string;
  date: string;
  time: string | null;
  title: string;
  courseCode: string | null;
  type: EventType | null;
  color: string;
  href: string | null;
  // Marked as done, and whether it can be (obligs and other events, not exams).
  done: boolean;
  completable: boolean;
};

export function buildItems(
  events: CalendarEvent[],
  groups: Group[],
  prefs: Prefs
): CalItem[] {
  const items: CalItem[] = [];

  for (const e of events) {
    const courseKey = e.course_code ?? NO_COURSE_KEY;
    if (!isVisible(prefs, courseKey)) continue;
    items.push({
      key: `e-${e.id}`,
      kind: "event",
      id: e.id,
      date: e.event_date,
      time: shortTime(e.event_time),
      title: e.title,
      courseCode: e.course_code,
      type: e.type,
      color: colorFor(prefs, courseKey),
      href: null,
      done: Boolean(e.completed_at),
      completable: e.type !== "exam",
    });
  }

  for (const g of groups) {
    if (!g.event_date) continue;
    if (!isVisible(prefs, GROUPS_KEY)) continue;
    if (g.course_code && !isVisible(prefs, g.course_code)) continue;
    items.push({
      key: `g-${g.id}`,
      kind: "group",
      id: g.id,
      date: g.event_date,
      time: shortTime(g.event_time),
      title: g.name,
      courseCode: g.course_code,
      type: null,
      color: colorFor(prefs, g.course_code ?? GROUPS_KEY),
      href: `/groups/${g.id}`,
      done: false,
      completable: false,
    });
  }

  return items.sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      (a.time ?? "").localeCompare(b.time ?? "") ||
      a.title.localeCompare(b.title)
  );
}

export function groupByDate(items: CalItem[]) {
  const map = new Map<string, CalItem[]>();
  for (const item of items) {
    const list = map.get(item.date) ?? [];
    list.push(item);
    map.set(item.date, list);
  }
  return map;
}
