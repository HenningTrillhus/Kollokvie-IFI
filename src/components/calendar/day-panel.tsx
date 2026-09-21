"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import CourseSingleSelect from "@/components/course-single-select";
import QuarterTimePicker from "@/components/quarter-time-picker";
import { Field, inputClass, cardClass } from "@/components/form-ui";
import { EVENT_TYPES, EVENT_TYPE_KEYS, type EventType } from "@/lib/events";
import type { CalItem } from "@/lib/calendar-items";
import type { Course } from "@/lib/courses";
import { useI18n } from "@/lib/i18n/client";

export type NewEvent = {
  title: string;
  type: EventType;
  course: Course | null;
  time: string;
};

// What's on the selected day, plus a form to add something. The card keeps
// its size and scrolls on its own, so the page never has to.
export default function DayPanel({
  date,
  items,
  priorityCodes,
  saveError,
  onAdd,
  onDelete,
}: {
  date: string | null;
  items: CalItem[];
  priorityCodes: string[];
  saveError: boolean;
  onAdd: (values: NewEvent) => Promise<boolean>;
  onDelete: (id: string) => void;
}) {
  const { t, lang } = useI18n();
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<EventType>("exam");
  const [course, setCourse] = useState<Course | null>(null);
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);

  if (!date) {
    return (
      <section className={`flex min-h-[8rem] flex-1 items-center justify-center p-5 text-center ${cardClass}`}>
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

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const ok = await onAdd({ title: title.trim(), type, course, time });
    setSaving(false);
    if (ok) {
      setTitle("");
      setTime("");
      setFormOpen(false);
    }
  }

  return (
    <section className={`flex min-h-[8rem] flex-1 flex-col overflow-hidden ${cardClass}`}>
      <div className="flex shrink-0 items-center justify-between border-b border-card-border px-4 py-2.5">
        <h2 className="text-sm font-semibold">{heading}</h2>
        <button
          onClick={() => setFormOpen((v) => !v)}
          aria-expanded={formOpen}
          className="rounded-lg px-2.5 py-1 text-xs font-medium text-accent transition hover:bg-accent-soft active:scale-95"
        >
          {formOpen ? t("common.close") : `+ ${t("cal.addHeading")}`}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {items.length === 0 && !formOpen ? (
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
                      className="shrink-0 rounded-lg px-2 py-1 text-xs text-muted transition hover:bg-red-500/10 hover:text-red-500"
                    >
                      {t("common.delete")}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {formOpen && (
          <form
            onSubmit={submit}
            className="animate-fade-in space-y-3 border-t border-card-border p-4"
          >
            <Field label={t("cal.title")} htmlFor="cal-title">
              <input
                id="cal-title"
                type="text"
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("cal.titlePlaceholder")}
                className={inputClass}
              />
            </Field>

            <div>
              <p className="mb-1.5 text-sm font-medium">{t("cal.type")}</p>
              <div className="grid grid-cols-3 rounded-xl border border-card-border p-1 text-sm font-medium">
                {EVENT_TYPES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setType(value)}
                    className={`rounded-lg px-2 py-1.5 transition ${
                      type === value ? "bg-accent text-white" : "text-muted"
                    }`}
                  >
                    {t(EVENT_TYPE_KEYS[value])}
                  </button>
                ))}
              </div>
            </div>

            <Field label={`${t("cal.course")} (${t("cal.optional")})`}>
              <CourseSingleSelect value={course} onChange={setCourse} priorityCodes={priorityCodes} />
              {course && (
                <button
                  type="button"
                  onClick={() => setCourse(null)}
                  className="mt-1.5 text-xs text-muted transition hover:text-foreground"
                >
                  {t("cal.clearCourse")}
                </button>
              )}
            </Field>

            <Field label={`${t("cal.time")} (${t("cal.optional")})`} htmlFor="time-hour">
              <div className="max-w-[10rem]">
                <QuarterTimePicker value={time} onChange={setTime} />
              </div>
            </Field>

            {saveError && <p className="text-sm text-red-500">{t("cal.saveError")}</p>}

            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="h-11 w-full rounded-xl bg-accent text-sm font-medium text-white transition hover:bg-accent-hover active:scale-[0.99] disabled:opacity-60"
            >
              {saving ? t("cal.adding") : t("cal.add")}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
