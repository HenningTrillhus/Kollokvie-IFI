"use client";

import { useRef, useState, type ReactNode } from "react";
import { EVENT_TYPE_KEYS, toDateKey } from "@/lib/events";
import { semesterMonths, semesterRange, type Semester } from "@/lib/semesters";
import type { CalItem } from "@/lib/calendar-items";
import { cardClass } from "@/components/form-ui";
import { useI18n } from "@/lib/i18n/client";
import { localeFor } from "@/lib/i18n";

function parseKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// The semester as one continuous stretch of weeks. Months aren't boxed apart:
// they're alternating soft bands, so the eye reads it as a single timeline.
export function SemesterGrid({
  semester,
  itemsByDate,
  todayKey,
  loading,
  onPickDay,
}: {
  semester: Semester;
  itemsByDate: Map<string, CalItem[]>;
  todayKey: string;
  loading: boolean;
  onPickDay: (dateKey: string) => void;
}) {
  const { t } = useI18n();
  const range = semesterRange(semester);
  const monthNames = t("cal.months").split("|");
  const weekdays = t("cal.weekdays").split("|");

  // Full weeks from the Monday on/before the start to the Sunday on/after the end.
  const first = parseKey(range.start);
  first.setDate(first.getDate() - ((first.getDay() + 6) % 7));
  const last = parseKey(range.end);
  last.setDate(last.getDate() + ((7 - last.getDay()) % 7));

  const weeks: Date[][] = [];
  for (const cursor = new Date(first); cursor <= last; cursor.setDate(cursor.getDate() + 7)) {
    weeks.push(
      Array.from(
        { length: 7 },
        (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + i)
      )
    );
  }

  return (
    <div className={`transition-opacity ${loading ? "opacity-60" : ""}`}>
      <div className="sticky top-0 z-10 flex bg-card/95 backdrop-blur">
        <span className="w-10 shrink-0" />
        <div className="grid flex-1 grid-cols-7 pb-1 pt-2 text-center text-[11px] font-medium text-muted">
          {weekdays.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
      </div>

      {weeks.map((week, wi) => {
        const firstOfMonth = week.find((d) => d.getDate() === 1);
        const label = firstOfMonth
          ? monthNames[firstOfMonth.getMonth()]
          : wi === 0
            ? monthNames[week[0].getMonth()]
            : null;

        return (
          <div key={wi} className="flex">
            <span className="flex w-10 shrink-0 items-center justify-center text-[10px] font-semibold uppercase tracking-wide text-muted">
              {label?.slice(0, 3)}
            </span>
            <div className="grid flex-1 grid-cols-7">
              {week.map((date) => {
                const key = toDateKey(date.getFullYear(), date.getMonth(), date.getDate());
                const dayItems = itemsByDate.get(key) ?? [];
                const outside = key < range.start || key > range.end;
                const isToday = key === todayKey;
                const banded = date.getMonth() % 2 === 1;

                return (
                  <button
                    key={key}
                    onClick={() => onPickDay(key)}
                    className={`flex h-12 flex-col items-center justify-center gap-0.5 text-xs transition active:bg-accent-soft ${
                      banded ? "bg-accent-soft/60" : ""
                    } ${outside ? "opacity-35" : ""}`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full leading-none ${
                        isToday ? "bg-accent font-semibold text-white" : ""
                      } ${date.getDate() === 1 && !isToday ? "font-bold" : ""}`}
                    >
                      {date.getDate()}
                    </span>
                    <span className="flex h-1.5 gap-0.5">
                      {dayItems.slice(0, 3).map((it) => (
                        <span
                          key={it.key}
                          style={
                            it.done
                              ? { boxShadow: `inset 0 0 0 1px ${it.color}` }
                              : { backgroundColor: it.color }
                          }
                          className="h-1.5 w-1.5 rounded-full"
                        />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Every event of the semester as a list, grouped by month.
export function SemesterAgenda({
  semester,
  items,
  onPickDay,
}: {
  semester: Semester;
  items: CalItem[];
  onPickDay: (dateKey: string) => void;
}) {
  const { t, lang } = useI18n();
  const months = semesterMonths(semester);
  const range = semesterRange(semester);
  const monthNames = t("cal.months").split("|");

  const inSemester = items.filter((i) => i.date >= range.start && i.date <= range.end);
  const byMonth = new Map<number, CalItem[]>();
  inSemester.forEach((i) => {
    const m = Number(i.date.split("-")[1]) - 1;
    byMonth.set(m, [...(byMonth.get(m) ?? []), i]);
  });

  if (inSemester.length === 0) {
    return <p className="px-5 py-6 text-sm text-muted">{t("cal.semesterEmpty")}</p>;
  }

  return (
    <div className="pb-2">
      {months.map(({ month }) => {
        const list = byMonth.get(month);
        if (!list) return null;
        return (
          <section key={month}>
            <h3 className="sticky top-0 z-10 bg-card/95 px-5 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted backdrop-blur">
              {monthNames[month]}
            </h3>
            <div className="divide-y divide-card-border">
              {list.map((item) => {
                const date = parseKey(item.date);
                const weekday = date.toLocaleDateString(localeFor(lang), { weekday: "short" });
                return (
                  <button
                    key={item.key}
                    onClick={() => onPickDay(item.date)}
                    className="flex w-full items-center gap-3 px-5 py-2.5 text-left transition hover:bg-accent-soft active:bg-accent-soft"
                  >
                    <div className="w-9 shrink-0 text-center leading-tight">
                      <p className="text-base font-semibold">{date.getDate()}</p>
                      <p className="text-[10px] uppercase text-muted">{weekday}</p>
                    </div>
                    <span
                      aria-hidden
                      style={{ backgroundColor: item.done ? "#22c55e" : item.color }}
                      className="h-9 w-1 shrink-0 rounded-full"
                    />
                    <div className={`min-w-0 flex-1 ${item.done ? "opacity-55" : ""}`}>
                      <p
                        className={`truncate text-sm font-medium ${
                          item.done ? "line-through decoration-2" : ""
                        }`}
                      >
                        {item.title}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {item.type ? t(EVENT_TYPE_KEYS[item.type]) : t("cal.studyGroup")}
                        {item.courseCode ? ` · ${item.courseCode}` : ""}
                        {item.time ? ` · ${item.time}` : ""}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

// Two swipeable panes (overview / list) in one card. Each pane scrolls on its
// own, so the page itself never has to.
export function SemesterPanes({ overview, list }: { overview: ReactNode; list: ReactNode }) {
  const { t } = useI18n();
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const labels = [t("cal.paneOverview"), t("cal.paneList")];

  function handleScroll() {
    const el = scroller.current;
    if (!el || el.clientWidth === 0) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  }

  function goTo(index: number) {
    const el = scroller.current;
    if (el) el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div className={`flex min-h-[16rem] flex-1 flex-col overflow-hidden ${cardClass}`}>
      <div role="tablist" className="relative flex shrink-0 border-b border-card-border lg:hidden">
        {labels.map((label, i) => (
          <button
            key={label}
            role="tab"
            aria-selected={active === i}
            onClick={() => goTo(i)}
            className={`flex-1 px-3 py-2.5 text-sm font-medium transition active:opacity-70 ${
              active === i ? "text-foreground" : "text-muted"
            }`}
          >
            {label}
          </button>
        ))}
        <span
          aria-hidden
          className="absolute -bottom-px left-0 h-0.5 w-1/2 transition-transform duration-300 ease-out"
          style={{ transform: `translateX(${active * 100}%)` }}
        >
          <span className="mx-auto block h-full w-2/5 rounded-full bg-accent" />
        </span>
      </div>

      <div
        ref={scroller}
        onScroll={handleScroll}
        className="no-scrollbar flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overscroll-x-contain lg:grid lg:snap-none lg:grid-cols-2 lg:divide-x lg:divide-card-border lg:overflow-x-hidden"
      >
        <div className="h-full w-full shrink-0 snap-start snap-always overflow-y-auto overscroll-contain lg:w-auto lg:min-w-0">
          {overview}
        </div>
        <div className="h-full w-full shrink-0 snap-start snap-always overflow-y-auto overscroll-contain lg:w-auto lg:min-w-0">
          {list}
        </div>
      </div>
    </div>
  );
}
