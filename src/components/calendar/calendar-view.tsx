"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Page, cardClass } from "@/components/form-ui";
import MonthGrid from "@/components/calendar/month-grid";
import SemesterOverview, { SemesterAgenda } from "@/components/calendar/semester-view";
import DayPanel, { type NewEvent } from "@/components/calendar/day-panel";
import CourseFilter, { type FilterCourse } from "@/components/calendar/course-filter";
import { daysInMonth, toDateKey, type CalendarEvent } from "@/lib/events";
import { buildItems, groupByDate } from "@/lib/calendar-items";
import type { Pref, Prefs } from "@/lib/calendar-prefs";
import { getUserCourses, type Course } from "@/lib/courses";
import type { Group } from "@/lib/groups";
import {
  UIO_CALENDAR_URL,
  currentSemester,
  semesterMonths,
  semesterOfMonth,
  semesterRange,
  shiftSemester,
  type Semester,
} from "@/lib/semesters";
import { useI18n } from "@/lib/i18n/client";
import { localeFor } from "@/lib/i18n";

type Mode = "month" | "semester";

const navButton =
  "flex h-9 w-9 items-center justify-center rounded-xl text-muted transition hover:bg-accent-soft hover:text-foreground active:scale-90";

export default function CalendarView({ currentUserId }: { currentUserId: string }) {
  const { t, lang } = useI18n();
  const [now] = useState(() => new Date());
  const todayKey = toDateKey(now.getFullYear(), now.getMonth(), now.getDate());

  const [mode, setMode] = useState<Mode>("month");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [semester, setSemester] = useState<Semester>(() => currentSemester(now));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [prefs, setPrefs] = useState<Prefs>({});
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [extraCourses, setExtraCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState(false);

  // The dates we need events for: the shown month, or every month of the semester.
  let rangeStart: string;
  let rangeEnd: string;
  if (mode === "month") {
    rangeStart = toDateKey(year, month, 1);
    rangeEnd = toDateKey(year, month, daysInMonth(year, month));
  } else {
    const months = semesterMonths(semester);
    const first = months[0];
    const last = months[months.length - 1];
    rangeStart = toDateKey(first.year, first.month, 1);
    rangeEnd = toDateKey(last.year, last.month, daysInMonth(last.year, last.month));
  }

  async function loadCourseNames(codes: string[]) {
    const missing = codes.filter(Boolean);
    if (missing.length === 0) return;
    const supabase = createClient();
    const { data } = await supabase.from("courses").select("*").in("code", missing);
    if (data && data.length > 0) {
      setExtraCourses((prev) => {
        const known = new Set(prev.map((c) => c.code));
        return [...prev, ...(data as Course[]).filter((c) => !known.has(c.code))];
      });
    }
  }

  // Once: preferences, your courses, and the study groups you're in.
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const [{ data: prefRows }, courses, { data: memberRows }] = await Promise.all([
        supabase.from("calendar_prefs").select("key, color, visible").eq("user_id", currentUserId),
        getUserCourses(supabase, currentUserId),
        supabase.from("group_members").select("groups(*)").eq("user_id", currentUserId),
      ]);

      const loaded: Prefs = {};
      (prefRows ?? []).forEach((r) => {
        loaded[r.key as string] = { color: (r.color as string | null) ?? null, visible: r.visible as boolean };
      });
      setPrefs(loaded);
      setMyCourses(courses);

      const memberGroups = (memberRows ?? [])
        .map((row) => (row as unknown as { groups: Group | null }).groups)
        .filter((g): g is Group => g !== null && g.event_date !== null);
      setGroups(memberGroups);

      const known = new Set(courses.map((c) => c.code));
      await loadCourseNames(
        [...new Set(memberGroups.map((g) => g.course_code).filter((c): c is string => !!c))].filter(
          (c) => !known.has(c)
        )
      );
    })();
  }, [currentUserId]);

  // Events for whatever range is showing.
  useEffect(() => {
    (async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", currentUserId)
        .gte("event_date", rangeStart)
        .lte("event_date", rangeEnd)
        .order("event_date", { ascending: true });

      const list = (data ?? []) as CalendarEvent[];
      setEvents(list);
      setLoading(false);
      await loadCourseNames(
        [...new Set(list.map((e) => e.course_code).filter((c): c is string => !!c))]
      );
    })();
  }, [rangeStart, rangeEnd, currentUserId]);

  const items = useMemo(() => buildItems(events, groups, prefs), [events, groups, prefs]);
  const itemsByDate = useMemo(() => groupByDate(items), [items]);

  const filterCourses: FilterCourse[] = useMemo(() => {
    const byCode = new Map<string, FilterCourse>();
    [...extraCourses, ...myCourses].forEach((c) => byCode.set(c.code, { code: c.code, name: c.name }));
    return [...byCode.values()].sort((a, b) => a.code.localeCompare(b.code));
  }, [myCourses, extraCourses]);

  // ---- navigation
  function changeMonth(delta: number) {
    let nextMonth = month + delta;
    let nextYear = year;
    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    } else if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
    setMonth(nextMonth);
    setYear(nextYear);
    setSelectedDate(null);
  }

  function goToday() {
    setYear(now.getFullYear());
    setMonth(now.getMonth());
    setSelectedDate(todayKey);
  }

  function switchMode(next: Mode) {
    if (next === mode) return;
    if (next === "semester") {
      setSemester(semesterOfMonth(year, month));
    } else {
      const range = semesterRange(semester);
      const inThisSemester = todayKey >= range.start && todayKey <= range.end;
      setYear(semester.year);
      setMonth(inThisSemester ? now.getMonth() : range.startMonth);
    }
    setSelectedDate(null);
    setMode(next);
  }

  function pickMonth(y: number, m: number, date: string | null = null) {
    setYear(y);
    setMonth(m);
    setSelectedDate(date);
    setMode("month");
  }

  // ---- data changes
  async function addEvent(v: NewEvent) {
    if (!selectedDate) return false;
    setSaveError(false);
    const supabase = createClient();
    const payload: Record<string, unknown> = {
      user_id: currentUserId,
      title: v.title,
      event_date: selectedDate,
      type: v.type,
    };
    if (v.time) payload.event_time = v.time;
    if (v.course) payload.course_code = v.course.code;

    const { data, error } = await supabase.from("events").insert(payload).select().single();
    if (error || !data) {
      setSaveError(true);
      return false;
    }
    setEvents((prev) =>
      [...prev, data as CalendarEvent].sort((a, b) => a.event_date.localeCompare(b.event_date))
    );
    if (v.course) {
      const course = v.course;
      setExtraCourses((prev) => (prev.some((c) => c.code === course.code) ? prev : [...prev, course]));
    }
    return true;
  }

  async function deleteEvent(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (!error) setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  async function updatePref(key: string, patch: Partial<Pref>) {
    const previous = prefs[key];
    const next: Pref = { color: previous?.color ?? null, visible: previous?.visible ?? true, ...patch };
    setPrefs((p) => ({ ...p, [key]: next }));

    const supabase = createClient();
    const { error } = await supabase
      .from("calendar_prefs")
      .upsert(
        { user_id: currentUserId, key, color: next.color, visible: next.visible },
        { onConflict: "user_id,key" }
      );
    if (error) {
      setPrefs((p) => {
        const copy = { ...p };
        if (previous) copy[key] = previous;
        else delete copy[key];
        return copy;
      });
    }
  }

  // ---- header
  const monthNames = t("cal.months").split("|");
  const dateFmt = (key: string) => {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(localeFor(lang), {
      day: "numeric",
      month: "short",
    });
  };
  const semRange = semesterRange(semester);
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  const title =
    mode === "month"
      ? `${monthNames[month]} ${year}`
      : `${t(semester.term === "spring" ? "cal.spring" : "cal.autumn")} ${semester.year}`;

  return (
    <Page width="max-w-xl">
      <div className={`space-y-4 p-4 ${cardClass}`}>
        <div className="grid grid-cols-2 rounded-xl border border-card-border p-1 text-sm font-medium">
          {(
            [
              ["month", t("cal.viewMonth")],
              ["semester", t("cal.viewSemester")],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => switchMode(value)}
              className={`rounded-lg px-3 py-1.5 transition ${
                mode === value ? "bg-accent text-white" : "text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() =>
              mode === "month" ? changeMonth(-1) : setSemester(shiftSemester(semester, -1))
            }
            aria-label={mode === "month" ? t("cal.prevMonth") : t("cal.prevSemester")}
            className={navButton}
          >
            ‹
          </button>
          <div className="text-center">
            <h1 className="text-lg font-semibold leading-tight">{title}</h1>
            {mode === "semester" && (
              <>
                <p className="text-xs text-muted">
                  {dateFmt(semRange.start)} – {dateFmt(semRange.end)}
                </p>
                <a
                  href={UIO_CALENDAR_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-muted underline-offset-2 hover:text-foreground hover:underline"
                >
                  {t("cal.semesterSource")}
                </a>
              </>
            )}
            {mode === "month" && !isCurrentMonth && (
              <button
                onClick={goToday}
                className="text-xs font-medium text-accent transition hover:text-accent-hover"
              >
                {t("cal.today")}
              </button>
            )}
          </div>
          <button
            onClick={() =>
              mode === "month" ? changeMonth(1) : setSemester(shiftSemester(semester, 1))
            }
            aria-label={mode === "month" ? t("cal.nextMonth") : t("cal.nextSemester")}
            className={navButton}
          >
            ›
          </button>
        </div>

        {mode === "month" ? (
          <div>
            <MonthGrid
              year={year}
              month={month}
              itemsByDate={itemsByDate}
              selectedDate={selectedDate}
              todayKey={todayKey}
              loading={loading}
              onSelect={setSelectedDate}
              onSwipe={changeMonth}
            />
          </div>
        ) : null}

        {mode === "semester" && (
          <SemesterOverview
            semester={semester}
            itemsByDate={itemsByDate}
            todayKey={todayKey}
            loading={loading}
            onPickDay={(key) => {
              const [y, m] = key.split("-").map(Number);
              pickMonth(y, m - 1, key);
            }}
            onPickMonth={(y, m) => pickMonth(y, m)}
          />
        )}
      </div>

      {mode === "semester" && (
        <SemesterAgenda
          semester={semester}
          items={items}
          onPickDay={(key) => {
            const [y, m] = key.split("-").map(Number);
            pickMonth(y, m - 1, key);
          }}
        />
      )}

      {mode === "month" && (
        <DayPanel
          key={selectedDate ?? "none"}
          date={selectedDate}
          items={selectedDate ? itemsByDate.get(selectedDate) ?? [] : []}
          priorityCodes={myCourses.map((c) => c.code)}
          saveError={saveError}
          onAdd={addEvent}
          onDelete={deleteEvent}
        />
      )}

      <CourseFilter courses={filterCourses} prefs={prefs} onChange={updatePref} />
    </Page>
  );
}
