"use client";

import { useState } from "react";
import { cardClass } from "@/components/form-ui";
import {
  GROUPS_KEY,
  NO_COURSE_KEY,
  PALETTE,
  colorFor,
  isVisible,
  type Pref,
  type Prefs,
} from "@/lib/calendar-prefs";
import { useI18n } from "@/lib/i18n/client";

export type FilterCourse = { code: string; name: string };

// Choose which courses show on the calendar, and what color each one has.
export default function CourseFilter({
  courses,
  prefs,
  onChange,
}: {
  courses: FilterCourse[];
  prefs: Prefs;
  onChange: (key: string, patch: Partial<Pref>) => void;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const rows = [
    ...courses.map((c) => ({ key: c.code, label: c.code, sub: c.name })),
    { key: GROUPS_KEY, label: t("cal.groupsLabel"), sub: "" },
    { key: NO_COURSE_KEY, label: t("cal.noCourseLabel"), sub: "" },
  ];
  const shown = rows.filter((r) => isVisible(prefs, r.key)).length;

  function setAll(visible: boolean) {
    rows.forEach((r) => onChange(r.key, { visible }));
  }

  return (
    <div className={`overflow-hidden ${cardClass}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left transition hover:bg-accent-soft/60"
      >
        <span>
          <span className="block text-sm font-medium">{t("cal.filters")}</span>
          <span className="block text-xs text-muted">
            {t("cal.filtersShown", { shown, total: rows.length })}
          </span>
        </span>
        <span className="flex items-center gap-2">
          <span className="flex -space-x-1">
            {rows.slice(0, 5).map((r) => (
              <span
                key={r.key}
                style={{ backgroundColor: colorFor(prefs, r.key) }}
                className={`h-3.5 w-3.5 rounded-full ring-2 ring-card ${
                  isVisible(prefs, r.key) ? "" : "opacity-30"
                }`}
              />
            ))}
          </span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            className={`h-4 w-4 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="border-t border-card-border">
          <div className="flex justify-end gap-4 px-4 py-2 text-xs font-medium">
            <button onClick={() => setAll(true)} className="text-accent hover:text-accent-hover">
              {t("cal.showAll")}
            </button>
            <button onClick={() => setAll(false)} className="text-muted hover:text-foreground">
              {t("cal.hideAll")}
            </button>
          </div>
          <div className="divide-y divide-card-border">
            {rows.map((r) => (
              <PrefRow
                key={r.key}
                label={r.label}
                sub={r.sub}
                color={colorFor(prefs, r.key)}
                visible={isVisible(prefs, r.key)}
                onColor={(color) => onChange(r.key, { color })}
                onToggle={(visible) => onChange(r.key, { visible })}
              />
            ))}
          </div>
          {courses.length === 0 && (
            <p className="border-t border-card-border px-4 py-3 text-xs text-muted">
              {t("cal.noCoursesHint")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function PrefRow({
  label,
  sub,
  color,
  visible,
  onColor,
  onToggle,
}: {
  label: string;
  sub: string;
  color: string;
  visible: boolean;
  onColor: (color: string) => void;
  onToggle: (visible: boolean) => void;
}) {
  const { t } = useI18n();
  const [picking, setPicking] = useState(false);

  return (
    <div className="px-4 py-2.5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setPicking((v) => !v)}
          aria-label={t("cal.pickColor", { name: label })}
          aria-expanded={picking}
          style={{ backgroundColor: color }}
          className={`h-7 w-7 shrink-0 rounded-full transition active:scale-90 ${
            picking ? "ring-2 ring-foreground ring-offset-2 ring-offset-card" : ""
          } ${visible ? "" : "opacity-40"}`}
        />
        <div className={`min-w-0 flex-1 ${visible ? "" : "opacity-50"}`}>
          <p className="truncate text-sm font-medium">{label}</p>
          {sub && <p className="truncate text-xs text-muted">{sub}</p>}
        </div>
        <button
          role="switch"
          aria-checked={visible}
          aria-label={t("cal.toggle", { name: label })}
          onClick={() => onToggle(!visible)}
          className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
            visible ? "bg-accent" : "bg-card-border"
          }`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              visible ? "translate-x-4" : ""
            }`}
          />
        </button>
      </div>

      {picking && (
        <div className="mt-2.5 flex flex-wrap gap-2.5 pl-10">
          {PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => {
                onColor(c);
                setPicking(false);
              }}
              aria-label={c}
              style={{ backgroundColor: c }}
              className={`h-7 w-7 rounded-full transition active:scale-90 ${
                color.toLowerCase() === c
                  ? "ring-2 ring-foreground ring-offset-2 ring-offset-card"
                  : "hover:scale-110"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
