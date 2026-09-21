"use client";

import { useRef } from "react";
import DoneCheck from "@/components/calendar/done-check";
import { EVENT_TYPE_KEYS, daysUntil } from "@/lib/events";
import type { CalItem } from "@/lib/calendar-items";
import { useFlip } from "@/lib/use-flip";
import { useI18n } from "@/lib/i18n/client";
import { localeFor } from "@/lib/i18n";

// How long until your next exams and obligs: a swipeable row of small cards.
// Finished obligs slide to the back of the row and get crossed out.
export default function UpcomingStrip({
  items,
  todayKey,
  onPick,
  onToggleDone,
}: {
  items: CalItem[];
  todayKey: string;
  onPick: (dateKey: string) => void;
  onToggleDone: (item: CalItem, source: HTMLElement) => void;
}) {
  const { t, lang } = useI18n();
  const scroller = useRef<HTMLDivElement>(null);
  useFlip(scroller);

  if (items.length === 0) return null;

  return (
    <section aria-label={t("cal.upcoming")} className="shrink-0">
      <h2 className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-muted [@media(max-height:780px)]:hidden">
        {t("cal.upcoming")}
      </h2>
      <div
        ref={scroller}
        className="no-scrollbar relative -mx-4 flex scroll-px-4 snap-x snap-mandatory gap-2.5 overflow-x-auto overscroll-x-contain px-4"
      >
        {items.map((item) => {
          const days = daysUntil(item.date, todayKey);
          const [y, m, d] = item.date.split("-").map(Number);
          const dateLabel = new Date(y, m - 1, d).toLocaleDateString(localeFor(lang), {
            weekday: "short",
            day: "numeric",
            month: "short",
          });
          const urgent = days <= 3 && !item.done;

          return (
            <div
              key={item.key}
              data-flip={item.key}
              className="relative h-[58px] w-[14.5rem] shrink-0 snap-start"
            >
              <button
                onClick={() => onPick(item.date)}
                className={`flex h-full w-full items-center gap-3 overflow-hidden rounded-2xl border bg-card ${item.completable ? "pr-12" : "pr-3"} text-left transition-all duration-500 active:scale-[0.98] ${
                  item.done ? "border-green-500/40 bg-green-500/5" : "border-card-border"
                }`}
              >
                <span
                  aria-hidden
                  style={{ backgroundColor: item.done ? "#22c55e" : item.color }}
                  className="h-full w-1.5 shrink-0 transition-colors duration-500"
                />
                <div className="w-14 shrink-0 text-center leading-none">
                  {item.done ? (
                    <p className="text-[11px] font-bold uppercase tracking-wide text-green-600">
                      {t("cal.done")}
                    </p>
                  ) : days <= 1 ? (
                    <p className={`text-sm font-bold ${urgent ? "text-red-500" : ""}`}>
                      {days === 0 ? t("cal.today") : t("cal.tomorrow")}
                    </p>
                  ) : (
                    <>
                      <p className={`text-xl font-bold ${urgent ? "text-red-500" : ""}`}>{days}</p>
                      <p className="mt-0.5 text-[10px] uppercase text-muted">{t("cal.daysUnit")}</p>
                    </>
                  )}
                </div>
                <div className={`min-w-0 transition-opacity duration-500 ${item.done ? "opacity-55" : ""}`}>
                  <p
                    className={`truncate text-sm font-semibold ${
                      item.done ? "line-through decoration-2" : ""
                    }`}
                  >
                    {item.title}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {item.type ? t(EVENT_TYPE_KEYS[item.type]) : ""}
                    {item.courseCode ? ` · ${item.courseCode}` : ""}
                  </p>
                  <p className="truncate text-[11px] text-muted">
                    {dateLabel}
                    {item.time ? ` · ${item.time}` : ""}
                  </p>
                </div>
              </button>

              {item.completable && (
                <DoneCheck
                  done={item.done}
                  onToggle={(el) => onToggleDone(item, el)}
                  className="absolute right-2.5 top-1/2 h-8 w-8 -translate-y-1/2"
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
