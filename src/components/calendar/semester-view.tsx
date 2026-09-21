"use client";

import { daysInMonth, firstWeekdayMondayIndex, toDateKey } from "@/lib/events";
import { EVENT_TYPE_KEYS } from "@/lib/events";
import { semesterMonths, semesterRange, type Semester } from "@/lib/semesters";
import type { CalItem } from "@/lib/calendar-items";
import { cardClass } from "@/components/form-ui";
import { useI18n } from "@/lib/i18n/client";
import { localeFor } from "@/lib/i18n";

// The whole semester at a glance: one small grid per month. Tapping a day
// opens it in the month view.
export default function SemesterOverview({
  semester,
  itemsByDate,
  todayKey,
  loading,
  onPickDay,
  onPickMonth,
}: {
  semester: Semester;
  itemsByDate: Map<string, CalItem[]>;
  todayKey: string;
  loading: boolean;
  onPickDay: (dateKey: string) => void;
  onPickMonth: (year: number, month: number) => void;
}) {
  const { t } = useI18n();
  const months = semesterMonths(semester);
  const range = semesterRange(semester);
  const monthNames = t("cal.months").split("|");
  const weekdayInitials = t("cal.weekdays")
    .split("|")
    .map((d) => d.charAt(0));

  return (
    <>
      <div
        className={`grid grid-cols-2 gap-x-4 gap-y-5 transition-opacity ${
          loading ? "opacity-50" : ""
        }`}
      >
        {months.map(({ year, month }) => {
          const cells: (number | null)[] = [
            ...Array(firstWeekdayMondayIndex(year, month)).fill(null),
            ...Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1),
          ];
          return (
            <div key={month}>
              <button
                onClick={() => onPickMonth(year, month)}
                className="mb-1.5 text-sm font-semibold transition hover:text-accent"
              >
                {monthNames[month]}
              </button>
              <div className="grid grid-cols-7 text-center text-[10px] text-muted">
                {weekdayInitials.map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-0.5 text-center">
                {cells.map((day, i) => {
                  if (day === null) return <span key={i} />;
                  const key = toDateKey(year, month, day);
                  const dayItems = itemsByDate.get(key) ?? [];
                  const outside = key < range.start || key > range.end;
                  const isToday = key === todayKey;
                  return (
                    <button
                      key={key}
                      onClick={() => onPickDay(key)}
                      className={`flex h-[26px] flex-col items-center justify-center rounded-md text-[11px] leading-none transition hover:bg-accent-soft active:scale-90 ${
                        outside ? "text-muted/40" : ""
                      } ${isToday ? "font-bold text-accent" : ""}`}
                    >
                      {day}
                      <span className="mt-0.5 flex h-1 gap-px">
                        {dayItems.slice(0, 3).map((it) => (
                          <span
                            key={it.key}
                            style={{ backgroundColor: it.color }}
                            className="h-1 w-1 rounded-full"
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
    </>
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

  return (
      <div className="space-y-4">
        {inSemester.length === 0 ? (
          <p className={`px-4 py-5 text-sm text-muted ${cardClass}`}>{t("cal.semesterEmpty")}</p>
        ) : (
          months.map(({ month }) => {
            const list = byMonth.get(month);
            if (!list) return null;
            return (
              <section key={month}>
                <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted">
                  {monthNames[month]}
                </h3>
                <div className={`divide-y divide-card-border overflow-hidden ${cardClass}`}>
                  {list.map((item) => {
                    const [y, m, d] = item.date.split("-").map(Number);
                    const weekday = new Date(y, m - 1, d).toLocaleDateString(localeFor(lang), {
                      weekday: "short",
                    });
                    return (
                      <button
                        key={item.key}
                        onClick={() => onPickDay(item.date)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-accent-soft active:bg-accent-soft"
                      >
                        <div className="w-9 shrink-0 text-center leading-tight">
                          <p className="text-base font-semibold">{d}</p>
                          <p className="text-[10px] uppercase text-muted">{weekday}</p>
                        </div>
                        <span
                          aria-hidden
                          style={{ backgroundColor: item.color }}
                          className="h-9 w-1 shrink-0 rounded-full"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{item.title}</p>
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
          })
        )}
      </div>
  );
}
