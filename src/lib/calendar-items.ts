import { GROUPS_KEY, NO_COURSE_KEY, colorFor, isVisible, type Prefs } from "@/lib/calendar-prefs";
import type { CourseDeadline } from "@/lib/course-deadlines";
import type { CourseExam } from "@/lib/course-exams";
import { shortTime, type CalendarEvent, type EventType } from "@/lib/events";
import type { Group } from "@/lib/groups";

// One thing on the calendar: the user's own event, a study group session, or
// an official exam/oblig date, already resolved to a color and filtered by
// the course settings.
export type CalItem = {
  key: string;
  kind: "event" | "group" | "exam" | "deadline";
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
  // The text of a note.
  body: string | null;
};

export function buildItems(
  events: CalendarEvent[],
  groups: Group[],
  exams: CourseExam[],
  deadlines: CourseDeadline[],
  prefs: Prefs,
  // The generic "Exam"/"Oblig" titles, translated (see cal.exam / cal.oblig) —
  // official exams and obliger never have their own title, same as a
  // title-less one you'd add yourself.
  examTitle: string,
  deadlineTitle: string,
  // Which automatically-added obliger you've ticked off (course_deadlines.id).
  completedDeadlineIds: Set<string> = new Set(),
  // Official exams/obliger you've edited or deleted (see user_hidden_exams /
  // user_hidden_deadlines) — once hidden, an edited one lives on as a normal
  // event instead, so it isn't dropped, just no longer shown twice.
  hiddenExamIds: Set<string> = new Set(),
  hiddenDeadlineIds: Set<string> = new Set()
): CalItem[] {
  const items: CalItem[] = [];

  for (const e of events) {
    const courseKey = e.course_code ?? NO_COURSE_KEY;
    // Notes have no course, so the course filters never hide them.
    if (e.type !== "note" && !isVisible(prefs, courseKey)) continue;
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
      completable: e.type !== "exam" && e.type !== "note",
      body: e.body ?? null,
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
      body: null,
    });
  }

  for (const x of exams) {
    if (!isVisible(prefs, x.course_code) || hiddenExamIds.has(x.id)) continue;
    items.push({
      key: `x-${x.id}`,
      kind: "exam",
      id: x.id,
      date: x.exam_date,
      time: shortTime(x.exam_time),
      title: examTitle,
      courseCode: x.course_code,
      type: "exam",
      color: colorFor(prefs, x.course_code),
      href: x.source_url,
      done: false,
      completable: false,
      body: x.note,
    });
  }

  for (const d of deadlines) {
    if (!isVisible(prefs, d.course_code) || hiddenDeadlineIds.has(d.id)) continue;
    items.push({
      key: `d-${d.id}`,
      kind: "deadline",
      id: d.id,
      date: d.deadline_date,
      time: shortTime(d.deadline_time),
      title: deadlineTitle,
      courseCode: d.course_code,
      type: "deadline",
      color: colorFor(prefs, d.course_code),
      href: d.source_url,
      done: completedDeadlineIds.has(d.id),
      completable: true,
      body: d.note,
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
