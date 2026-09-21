"use client";

import { useState, type FormEvent } from "react";
import CourseSingleSelect from "@/components/course-single-select";
import TimePicker from "@/components/time-picker";
import DatePicker from "@/components/date-picker";
import { Field } from "@/components/form-ui";
import { EVENT_TYPES, EVENT_TYPE_KEYS, type EventType } from "@/lib/events";
import type { Course } from "@/lib/courses";
import { useI18n } from "@/lib/i18n/client";
import { cleanLine } from "@/lib/sanitize";

export type NewEvent = {
  title: string;
  type: EventType;
  course: Course | null;
  time: string;
  // The day it is on. Adding uses the selected day; editing lets you move it.
  date: string;
};

const bigInput =
  "block h-11 w-full min-w-0 rounded-xl border border-card-border bg-transparent px-4 text-base outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft sm:h-12";

// The "add an event" form, made for thumbs: big fields, big buttons. It lives
// in a tall sheet that covers the calendar while you fill it in.
export default function AddEventForm({
  saveError,
  priorityCodes,
  onSubmit,
  initial,
  defaultDate,
}: {
  saveError: boolean;
  priorityCodes: string[];
  // Given when editing an existing event: the fields start filled in.
  initial?: NewEvent;
  // When adding: the day that is selected in the calendar, if any.
  defaultDate?: string;
  onSubmit: (values: NewEvent) => Promise<boolean>;
}) {
  const { t } = useI18n();
  const editing = Boolean(initial);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [type, setType] = useState<EventType>(initial?.type ?? "exam");
  const [course, setCourse] = useState<Course | null>(initial?.course ?? null);
  const [time, setTime] = useState(initial?.time ?? "");
  const [date, setDate] = useState(initial?.date ?? defaultDate ?? "");
  const [saving, setSaving] = useState(false);

  // An exam or oblig needs no title: it is simply called "Exam" / "Oblig".
  const defaultTitle = type === "other" ? "" : t(EVENT_TYPE_KEYS[type]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const clean = cleanLine(title) || defaultTitle;
    if (!clean || !date) return;
    setSaving(true);
    const ok = await onSubmit({ title: clean, type, course, time, date });
    // On success the sheet closes and this form goes away with it.
    if (!ok) setSaving(false);
  }

  return (
    <form onSubmit={submit} className="flex min-h-full flex-col">
      <div className="flex-1 space-y-4 px-5 pb-3 pt-1 sm:space-y-5 sm:pb-4 sm:pt-2">
        <Field label={t("cal.title")} htmlFor="cal-title">
          <input
            id="cal-title"
            type="text"
            autoFocus
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={defaultTitle || t("cal.titlePlaceholder")}
            className={bigInput}
          />
        </Field>

        <div>
          <p className="mb-1.5 text-sm font-medium">{t("cal.type")}</p>
          <div className="grid grid-cols-3 gap-2">
            {EVENT_TYPES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                className={`h-11 rounded-xl border text-sm font-medium transition active:scale-95 sm:h-12 ${
                  type === value
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-card-border text-muted"
                }`}
              >
                {t(EVENT_TYPE_KEYS[value])}
              </button>
            ))}
          </div>
        </div>

        <Field label={t("cal.date")} htmlFor="cal-date">
          <DatePicker id="cal-date" value={date} onChange={setDate} large />
        </Field>

        <Field label={`${t("cal.course")} (${t("cal.optional")})`}>
          <CourseSingleSelect value={course} onChange={setCourse} priorityCodes={priorityCodes} />
          {course && (
            <button
              type="button"
              onClick={() => setCourse(null)}
              className="mt-2 text-sm text-muted transition hover:text-foreground"
            >
              {t("cal.clearCourse")}
            </button>
          )}
        </Field>

        <Field label={`${t("cal.time")} (${t("cal.optional")})`} htmlFor="time-trigger">
          {/* Any minute, for every kind of event. */}
          <TimePicker id="time-trigger" value={time} onChange={setTime} anyMinute large />
        </Field>

        {saveError && <p className="text-sm text-red-500">{t("cal.saveError")}</p>}
      </div>

      <div className="sticky bottom-0 border-t border-card-border bg-card px-5 py-2.5 sm:py-3">
        <button
          type="submit"
          disabled={saving || (!title.trim() && !defaultTitle) || !date}
          className="min-h-[3rem] w-full rounded-2xl bg-accent text-base font-semibold text-white transition hover:bg-accent-hover active:scale-[0.99] disabled:opacity-60"
        >
          {editing
            ? saving
              ? t("cal.saving")
              : t("cal.save")
            : saving
              ? t("cal.adding")
              : t("cal.add")}
        </button>
      </div>
    </form>
  );
}
