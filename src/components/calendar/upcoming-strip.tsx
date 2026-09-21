"use client";

import { EVENT_TYPE_KEYS, daysUntil } from "@/lib/events";
import type { CalItem } from "@/lib/calendar-items";
import { useI18n } from "@/lib/i18n/client";
import { localeFor } from "@/lib/i18n";

// How long until your next exams and obligs: a swipeable row of small cards.
export default function UpcomingStrip({
  items,
  todayKey,
  onPick,
}: {
  items: CalItem[];
  todayKey: string;
  onPick: (dateKey: string) => void;
}) {
  const { t, lang } = useI18n();
  if (items.length === 0) return null;

  return (
    <section aria-label={t("cal.upcoming")} className="shrink-0">
      <h2 className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-muted">
        {t("cal.upcoming")}
      </h2>
      <div className="no-scrollbar -mx-4 flex scroll-px-4 snap-x snap-mandatory gap-2.5 overflow-x-auto overscroll-x-contain px-4">
        {items.map((item) => {
          const days = daysUntil(item.date, todayKey);
          const [y, m, d] = item.date.split("-").map(Number);
          const dateLabel = new Date(y, m - 1, d).toLocaleDateString(localeFor(lang), {
            weekday: "short",
            day: "numeric",
            month: "short",
          });
          const urgent = days <= 3;

          return (
            <button
              key={item.key}
              onClick={() => onPick(item.date)}
              className="flex h-[64px] w-[15rem] shrink-0 snap-start items-center gap-3 overflow-hidden rounded-2xl border border-card-border bg-card pr-3 text-left transition active:scale-[0.98]"
            >
              <span
                aria-hidden
                style={{ backgroundColor: item.color }}
                className="h-full w-1.5 shrink-0"
              />
              <div className="w-14 shrink-0 text-center leading-none">
                {days <= 1 ? (
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
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{item.title}</p>
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
          );
        })}
      </div>
    </section>
  );
}
