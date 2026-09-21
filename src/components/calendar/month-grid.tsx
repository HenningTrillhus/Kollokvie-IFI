"use client";

import { useRef, type TouchEvent } from "react";
import { daysInMonth, firstWeekdayMondayIndex, toDateKey } from "@/lib/events";
import type { CalItem } from "@/lib/calendar-items";
import { useI18n } from "@/lib/i18n/client";

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
        className={`mt-0.5 grid min-h-0 flex-1 grid-cols-7 gap-0.5 transition-opacity ${slide} ${
          loading ? "opacity-60" : ""
        }`}
      >
        {cells.map((day, index) => {
          if (day === null) return <div key={index} />;
          const dateKey = toDateKey(year, month, day);
          const items = itemsByDate.get(dateKey) ?? [];
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === selectedDate;

          return (
            <button
              key={dateKey}
              onClick={() => onSelect(dateKey)}
              className={`flex min-h-0 flex-col items-center justify-center gap-0.5 rounded-xl border text-sm transition active:scale-95 lg:items-stretch lg:justify-start lg:gap-1 lg:overflow-hidden lg:p-1.5 lg:active:scale-[0.99] ${
                isSelected
                  ? "border-accent bg-accent-soft"
                  : "border-transparent hover:bg-accent-soft/60 lg:border-card-border/60"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-xs leading-none lg:self-start ${
                  isToday ? "bg-accent font-semibold text-white" : ""
                }`}
              >
                {day}
              </span>
              {/* Wide screens have room for the titles themselves. */}
              <span className="hidden min-h-0 flex-col gap-0.5 text-left lg:flex">
                {items.slice(0, 3).map((item) => (
                  <span
                    key={item.key}
                    style={{ borderLeft: `3px solid ${item.color}` }}
                    className={`truncate rounded-sm bg-accent-soft/70 px-1 text-[11px] leading-4 ${
                      item.done ? "text-muted line-through" : ""
                    }`}
                  >
                    {item.title}
                  </span>
                ))}
                {items.length > 3 && (
                  <span className="px-1 text-[10px] text-muted">+{items.length - 3}</span>
                )}
              </span>
              <span className="flex h-1.5 gap-0.5 lg:hidden">
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
