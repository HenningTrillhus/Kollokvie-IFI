"use client";

import Link from "next/link";
import { cardClass } from "@/components/form-ui";
import { EVENT_TYPE_KEYS } from "@/lib/events";
import type { CalItem } from "@/lib/calendar-items";
import { useI18n } from "@/lib/i18n/client";

// What's on the selected day. The card keeps its size and scrolls on its own,
// so the page never has to. Adding something opens a sheet (see add-event-form).
export default function DayPanel({
  date,
  items,
  onAdd,
  onDelete,
}: {
  date: string | null;
  items: CalItem[];
  onAdd: () => void;
  onDelete: (id: string) => void;
}) {
  const { t, lang } = useI18n();

  if (!date) {
    return (
      <section className={`flex min-h-[6rem] flex-[3] items-center justify-center p-4 text-center ${cardClass}`}>
        <p className="text-sm text-muted">{t("cal.hint")}</p>
      </section>
    );
  }

  const [, monthStr, dayStr] = date.split("-");
  const monthNames = t("cal.months").split("|");
  const monthName = monthNames[Number(monthStr) - 1];
  const heading = t("cal.dayHeading", {
    day: Number(dayStr),
    month: lang === "no" ? monthName.toLowerCase() : monthName,
  });

  return (
    <section className={`flex min-h-[6rem] flex-[3] flex-col overflow-hidden ${cardClass}`}>
      <div className="flex shrink-0 items-center justify-between border-b border-card-border px-4 py-2.5">
        <h2 className="text-sm font-semibold">{heading}</h2>
        <button
          onClick={onAdd}
          className="h-9 rounded-full bg-accent px-4 text-sm font-medium text-white transition hover:bg-accent-hover active:scale-95"
        >
          + {t("cal.addHeading")}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {items.length === 0 ? (
          <p className="px-4 py-4 text-sm text-muted">{t("cal.dayEmpty")}</p>
        ) : (
          <ul className="divide-y divide-card-border px-4">
            {items.map((item) => {
              const body = (
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span
                    aria-hidden
                    style={{ backgroundColor: item.color }}
                    className="h-9 w-1 shrink-0 rounded-full"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="truncate text-xs text-muted">
                      {item.type ? t(EVENT_TYPE_KEYS[item.type]) : t("cal.studyGroup")}
                      {item.courseCode ? ` · ${item.courseCode}` : ""}
                      {item.time ? ` · ${item.time}` : ""}
                    </p>
                  </div>
                </div>
              );
              return (
                <li key={item.key} className="flex items-center gap-2 py-2.5">
                  {item.href ? (
                    <Link href={item.href} className="flex min-w-0 flex-1 transition hover:opacity-80">
                      {body}
                    </Link>
                  ) : (
                    body
                  )}
                  {item.kind === "event" && (
                    <button
                      onClick={() => onDelete(item.id)}
                      aria-label={t("cal.deleteEvent")}
                      className="shrink-0 rounded-lg px-2 py-1.5 text-xs text-muted transition hover:bg-red-500/10 hover:text-red-500"
                    >
                      {t("common.delete")}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
