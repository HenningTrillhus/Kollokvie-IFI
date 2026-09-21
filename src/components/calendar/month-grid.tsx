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
  onSelect,
  onSwipe,
}: {
  year: number;
  month: number;
  itemsByDate: Map<string, CalItem[]>;
  selectedDate: string | null;
  todayKey: string;
  loading: boolean;
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

  return (
    <>
      <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-muted">
        {weekdays.map((day) => (
          <div key={day} className="pb-1">
            {day}
          </div>
        ))}
      </div>

      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`mt-1 grid touch-pan-y grid-cols-7 gap-1.5 transition-opacity ${
          loading ? "opacity-50" : ""
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
              className={`flex aspect-square flex-col items-center gap-1 rounded-xl border p-1.5 text-sm transition active:scale-95 ${
                isSelected
                  ? "border-accent bg-accent-soft"
                  : "border-card-border hover:bg-accent-soft/60"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                  isToday ? "bg-accent font-semibold text-white" : ""
                }`}
              >
                {day}
              </span>
              <div className="flex flex-wrap justify-center gap-0.5">
                {items.slice(0, 4).map((item) => (
                  <span
                    key={item.key}
                    style={{ backgroundColor: item.color }}
                    className="h-1.5 w-1.5 rounded-full"
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
