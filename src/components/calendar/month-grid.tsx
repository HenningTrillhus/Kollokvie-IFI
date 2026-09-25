"use client";

import { useRef, type TouchEvent } from "react";
import { EVENT_TYPE_KEYS, daysInMonth, firstWeekdayMondayIndex, toDateKey } from "@/lib/events";
import type { CalItem } from "@/lib/calendar-items";
import { useI18n } from "@/lib/i18n/client";

// Which item names the day: an exam beats an oblig, then study groups, then the rest.
const PRIORITY = { exam: 0, deadline: 1, group: 2, other: 3, note: 4 } as const;
function rank(item: CalItem) {
  return PRIORITY[item.type ?? "group"];
}

export default function MonthGrid({
  year,
  month,
  itemsByDate,
  selectedDate,
  todayKey,
  loading,
  direction,
  onSelect,
  onSwipe,
}: {
  year: number;
  month: number;
  itemsByDate: Map<string, CalItem[]>;
  selectedDate: string | null;
  todayKey: string;
  loading: boolean;
  direction: "next" | "prev" | null;
  onSelect: (dateKey: string) => void;
  onSwipe: (delta: number) => void;
}) {
  const { t } = useI18n();
  const weekdays = t("cal.weekdays").split("|");
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  function handleTouchStart(e: TouchEvent) {
    const p = e.touches[0];
    touchStart.current = { x: p.clientX, y: p.clientY };
  }

  function handleTouchEnd(e: TouchEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const p = e.changedTouches[0];
    const dx = p.clientX - start.x;
    const dy = p.clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) onSwipe(dx < 0 ? 1 : -1);
  }

  const cells: (number | null)[] = [
    ...Array(firstWeekdayMondayIndex(year, month)).fill(null),
    ...Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const slide =
    direction === "next"
      ? "animate-slide-from-right"
      : direction === "prev"
        ? "animate-slide-from-left"
        : "";

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="flex h-full min-h-0 touch-pan-y flex-col"
    >
      <div className="grid shrink-0 grid-cols-7 gap-1 text-center text-xs font-medium text-muted">
        {weekdays.map((day) => (
          <div key={day} className="pb-1">
            {day}
          </div>
        ))}
      </div>

      <div
        key={`${year}-${month}`}
        style={{ gridTemplateRows: `repeat(${cells.length / 7}, minmax(0, 1fr))` }}
        className={`mt-0.5 grid min-h-0 flex-1 grid-cols-7 gap-1 transition-opacity lg:gap-0.5 ${slide} ${
          loading ? "opacity-60" : ""
        }`}
      >
        {cells.map((day, index) => {
          if (day === null) return <div key={index} />;
          const dateKey = toDateKey(year, month, day);
          const everything = itemsByDate.get(dateKey) ?? [];
          // Notes get their own small dot; everything else names and tints the day.
          const items = everything.filter((i) => i.type !== "note");
          const hasNote = everything.length > items.length;
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === selectedDate;
          // What is on this day: its most important item names it, and the day is tinted.
          const top = [...items].sort((a, b) => rank(a) - rank(b))[0];
          const label = top ? (top.type ? t(EVENT_TYPE_KEYS[top.type]) : t("cal.groupShort")) : "";
          const strong = top ? rank(top) <= 1 : false;
          // One line per event (title, then course if there's one) so a full
          // week of busy days still has room for a few of them.
          const shownOnDesktop = 3;

          return (
            <button
              key={dateKey}
              onClick={() => onSelect(dateKey)}
              style={
                top && !isSelected
                  ? {
                      backgroundColor: `color-mix(in srgb, ${top.color} ${strong ? 16 : 9}%, transparent)`,
                    }
                  : undefined
              }
              className={`relative flex min-h-0 flex-col items-center justify-center gap-0.5 rounded-xl border text-sm transition active:scale-95 lg:items-stretch lg:justify-start lg:gap-1 lg:overflow-hidden lg:p-2 lg:active:scale-[0.99] ${
                isSelected
                  ? "border-accent bg-accent-soft"
                  : "border-transparent hover:bg-accent-soft/60 lg:border-card-border/60"
              }`}
            >
              {hasNote && (
                <span
                  aria-label={t("cal.note")}
                  title={t("cal.note")}
                  className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent"
                />
              )}
              <span className="flex flex-col items-center gap-0.5 lg:w-full lg:flex-row lg:justify-between">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-xs leading-none ${
                    isToday ? "bg-accent font-semibold text-white" : ""
                  }`}
                >
                  {day}
                </span>
                {top && (
                  // The kind of thing that's on this day, in small print.
                  <span
                    className={`max-w-full truncate text-[10px] font-semibold uppercase leading-none tracking-wide [@media(max-height:700px)]:hidden lg:text-[11px] ${
                      strong ? "text-foreground/80" : "text-muted"
                    }`}
                  >
                    {label}
                    {items.length > 1 ? ` +${items.length - 1}` : ""}
                  </span>
                )}
              </span>
              {/* Wide screens have room for the titles themselves, one line
                  each (title, then course) so a busy day still fits a few. */}
              <span className="hidden min-h-0 flex-col gap-1 text-left lg:flex">
                {items.slice(0, shownOnDesktop).map((item) => (
                  <span
                    key={item.key}
                    style={{ borderLeft: `3px solid ${item.color}` }}
                    className={`flex min-w-0 items-baseline gap-1 rounded-sm bg-accent-soft/70 px-1.5 py-0.5 text-[11px] leading-4 ${
                      item.done ? "text-muted line-through" : ""
                    }`}
                  >
                    <span className="min-w-0 truncate font-medium">{item.title}</span>
                    {item.courseCode && (
                      <span className="shrink-0 text-muted">{item.courseCode}</span>
                    )}
                  </span>
                ))}
                {items.length > shownOnDesktop && (
                  <span className="px-1.5 text-[10px] text-muted">+{items.length - shownOnDesktop}</span>
                )}
              </span>
              <span className="hidden h-1.5 gap-0.5 [@media(max-height:700px)_and_(max-width:1023px)]:flex">
                {items.slice(0, 4).map((item) => (
                  <span
                    key={item.key}
                    style={
                      item.done
                        ? { boxShadow: `inset 0 0 0 1px ${item.color}` }
                        : { backgroundColor: item.color }
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
}
