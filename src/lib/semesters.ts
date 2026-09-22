import { toDateKey } from "@/lib/events";

// UiO's semester dates. The official rule (Forskrift om studier og eksamener
// ved UiO, "Nærmere regler om datoer og frister") is:
//   Autumn: starts the Monday of week 33 (not before 10 August), ends 22 December
//           (the Friday before if that is a Saturday or Sunday).
//   Spring: starts 2 January (the following Monday if that is Thu–Sun),
//           ends the Friday of week 24.
// The table lists UiO's published dates for 2024–2030; other years are
// worked out with the rule.
// Source: https://www.uio.no/studier/om/kalender/

export type Term = "spring" | "autumn";
export type Semester = { year: number; term: Term };

export const UIO_CALENDAR_URL = "https://www.uio.no/studier/om/kalender/";

// [start, end] as [month(1-12), day]
type Span = [[number, number], [number, number]];
const PUBLISHED: Record<number, { spring: Span; autumn: Span }> = {
  2024: { spring: [[1, 2], [6, 14]], autumn: [[8, 12], [12, 20]] },
  2025: { spring: [[1, 6], [6, 13]], autumn: [[8, 11], [12, 19]] },
  2026: { spring: [[1, 5], [6, 12]], autumn: [[8, 10], [12, 22]] },
  2027: { spring: [[1, 4], [6, 18]], autumn: [[8, 16], [12, 22]] },
  2028: { spring: [[1, 3], [6, 16]], autumn: [[8, 14], [12, 22]] },
  2029: { spring: [[1, 2], [6, 15]], autumn: [[8, 13], [12, 21]] },
  2030: { spring: [[1, 2], [6, 14]], autumn: [[8, 12], [12, 20]] },
};

// Monday of ISO week `week` in `year`.
function isoWeekMonday(year: number, week: number) {
  const jan4 = new Date(year, 0, 4);
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7) + (week - 1) * 7);
  return monday;
}

function ruleSpan(year: number, term: Term): Span {
  if (term === "spring") {
    const start = new Date(year, 0, 2);
    // Thursday(4), Friday(5), Saturday(6), Sunday(0) -> following Monday
    while ([4, 5, 6, 0].includes(start.getDay())) start.setDate(start.getDate() + 1);
    const end = isoWeekMonday(year, 24);
    end.setDate(end.getDate() + 4);
    return [
      [start.getMonth() + 1, start.getDate()],
      [end.getMonth() + 1, end.getDate()],
    ];
  }
  const start = isoWeekMonday(year, 33);
  if (start < new Date(year, 7, 10)) start.setDate(start.getDate() + 7);
  const end = new Date(year, 11, 22);
  if (end.getDay() === 6) end.setDate(end.getDate() - 1);
  if (end.getDay() === 0) end.setDate(end.getDate() - 2);
  return [
    [start.getMonth() + 1, start.getDate()],
    [end.getMonth() + 1, end.getDate()],
  ];
}

export function semesterRange(sem: Semester) {
  const span = PUBLISHED[sem.year]?.[sem.term] ?? ruleSpan(sem.year, sem.term);
  const [[sm, sd], [em, ed]] = span;
  return {
    start: toDateKey(sem.year, sm - 1, sd),
    end: toDateKey(sem.year, em - 1, ed),
    startMonth: sm - 1,
    endMonth: em - 1,
  };
}

// Every calendar month the semester touches (full months, so the overview
// shows complete grids).
export function semesterMonths(sem: Semester) {
  const { startMonth, endMonth } = semesterRange(sem);
  return Array.from({ length: endMonth - startMonth + 1 }, (_, i) => ({
    year: sem.year,
    month: startMonth + i,
  }));
}

// Which semester you're "in": spring up to its end date, then autumn (this
// also covers the summer break, so you see what's coming), and from the end of
// autumn on, next year's spring.
export function currentSemester(today = new Date()): Semester {
  const year = today.getFullYear();
  const key = toDateKey(year, today.getMonth(), today.getDate());
  if (key <= semesterRange({ year, term: "spring" }).end) return { year, term: "spring" };
  if (key <= semesterRange({ year, term: "autumn" }).end) return { year, term: "autumn" };
  return { year: year + 1, term: "spring" };
}

export function shiftSemester(sem: Semester, delta: number): Semester {
  // spring(y) -> autumn(y) -> spring(y+1) ...
  const index = sem.year * 2 + (sem.term === "autumn" ? 1 : 0) + delta;
  return { year: Math.floor(index / 2), term: index % 2 === 0 ? "spring" : "autumn" };
}

export function semesterOfMonth(year: number, month: number): Semester {
  return { year, term: month <= 5 ? "spring" : "autumn" };
}

// UiO's own short form, e.g. "2026h" (matches the "h26"/"v26" in their own
// course URLs, just with the year first so it sorts correctly as text).
export function semesterCode(sem: Semester): string {
  return `${sem.year}${sem.term === "autumn" ? "h" : "v"}`;
}
