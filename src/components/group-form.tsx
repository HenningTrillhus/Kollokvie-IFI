"use client";

import { useState, type FormEvent } from "react";
import CourseSingleSelect from "@/components/course-single-select";
import { useI18n } from "@/lib/i18n/client";
import { Card, Field, StickyBar, inputClass } from "@/components/form-ui";
import QuarterTimePicker from "@/components/quarter-time-picker";
import type { Course } from "@/lib/courses";
import { VISIBILITY_KEYS, type Visibility } from "@/lib/groups";

export type GroupFormValues = {
  name: string;
  description: string;
  course: Course | null;
  visibility: Visibility;
  location: string;
  eventDate: string;
  eventTime: string;
  maxMembers: string;
};

export const EMPTY_GROUP_FORM: GroupFormValues = {
  name: "",
  description: "",
  course: null,
  visibility: "public",
  location: "",
  eventDate: "",
  eventTime: "",
  maxMembers: "",
};

const HINT_KEYS = {
  public: "group.publicHint",
  private: "group.privateHint",
  invite: "group.inviteHint",
} as const;

// Shared by "create" and "settings": same fields, same layout. The page
// supplies the initial values and what happens on submit (return an error
// message, or null on success).
export default function GroupForm({
  initial,
  priorityCodes,
  submitLabel,
  savingLabel,
  showSaved,
  onSubmit,
}: {
  initial: GroupFormValues;
  priorityCodes: string[];
  submitLabel: string;
  savingLabel: string;
  showSaved?: boolean;
  onSubmit: (values: GroupFormValues) => Promise<string | null>;
}) {
  const { t } = useI18n();
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function set<K extends keyof GroupFormValues>(key: K, value: GroupFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!values.name.trim()) return;
    setSaving(true);
    setErrorMessage("");
    setSaved(false);
    const error = await onSubmit(values);
    setSaving(false);
    if (error) setErrorMessage(error);
    else setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <Field label={t("group.name")} htmlFor="name">
          <input
            id="name"
            type="text"
            required
            maxLength={120}
            placeholder={t("group.namePlaceholder")}
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label={t("group.course")}>
          <CourseSingleSelect
            value={values.course}
            onChange={(course) => set("course", course)}
            priorityCodes={priorityCodes}
          />
        </Field>

        <Field label={t("group.description")} htmlFor="description">
          <textarea
            id="description"
            rows={3}
            maxLength={2000}
            placeholder={t("group.descriptionPlaceholder")}
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            className="block w-full min-w-0 resize-none rounded-xl border border-card-border bg-transparent px-3.5 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
          />
        </Field>
      </Card>

      <Card>
        <p className="text-sm font-medium">{t("group.visibility")}</p>
        <div role="radiogroup" aria-label={t("group.visibility")} className="space-y-2">
          {(["public", "private", "invite"] as const).map((value) => {
            const active = values.visibility === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => set("visibility", value)}
                className={`flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition ${
                  active
                    ? "border-accent bg-accent-soft"
                    : "border-card-border hover:bg-accent-soft/50"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    active ? "border-accent" : "border-muted/60"
                  }`}
                >
                  {active && <span className="h-2 w-2 rounded-full bg-accent" />}
                </span>
                <span className="min-w-0">
                  <span
                    className={`block text-sm font-medium ${active ? "text-accent" : ""}`}
                  >
                    {t(VISIBILITY_KEYS[value])}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {t(HINT_KEYS[value])}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <Field label={t("group.room")} htmlFor="location">
          <input
            id="location"
            type="text"
            maxLength={200}
            placeholder={t("group.roomPlaceholder")}
            value={values.location}
            onChange={(e) => set("location", e.target.value)}
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("group.date")} htmlFor="date">
            <input
              id="date"
              type="date"
              value={values.eventDate}
              onChange={(e) => set("eventDate", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label={t("group.time")} htmlFor="time-hour">
            <QuarterTimePicker
              value={values.eventTime}
              onChange={(v) => set("eventTime", v)}
            />
          </Field>
        </div>

        <Field label={t("group.max")} htmlFor="maxMembers">
          <input
            id="maxMembers"
            type="number"
            inputMode="numeric"
            min={1}
            placeholder={t("common.optional")}
            value={values.maxMembers}
            onChange={(e) => set("maxMembers", e.target.value)}
            className={inputClass}
          />
        </Field>
      </Card>

      {errorMessage && (
        <p role="alert" className="text-sm text-red-500">
          {errorMessage}
        </p>
      )}
      {showSaved && saved && <p className="text-sm text-accent">{t("common.saved")}</p>}

      <StickyBar>
        <button
          type="submit"
          disabled={saving || !values.name.trim()}
          className="h-11 w-full rounded-xl bg-accent px-4 text-sm font-medium text-white transition hover:bg-accent-hover active:scale-[0.99] disabled:opacity-60"
        >
          {saving ? savingLabel : submitLabel}
        </button>
      </StickyBar>
    </form>
  );
}
