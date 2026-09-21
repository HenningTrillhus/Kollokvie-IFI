"use client";

import { useState } from "react";
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
import ColorSwatchInput from "@/components/color-swatch-input";

export type FilterCourse = { code: string; name: string };

type Row = { key: string; label: string; sub: string };

function useRows(courses: FilterCourse[]): Row[] {
  const { t } = useI18n();
  return [
    ...courses.map((c) => ({ key: c.code, label: c.code, sub: c.name })),
    { key: GROUPS_KEY, label: t("cal.groupsLabel"), sub: "" },
    { key: NO_COURSE_KEY, label: t("cal.noCourseLabel"), sub: "" },
  ];
}

// A swipeable row of small toggles: tap one to show or hide that course.
export function FilterChips({
  courses,
  prefs,
  onChange,
  onOpenColors,
}: {
  courses: FilterCourse[];
  prefs: Prefs;
  onChange: (key: string, patch: Partial<Pref>) => void;
  onOpenColors: () => void;
}) {
  const { t } = useI18n();
  const rows = useRows(courses);

  return (
    <div className="no-scrollbar -mx-4 flex scroll-px-4 snap-x gap-2 overflow-x-auto overscroll-x-contain px-4">
      {rows.map((r) => {
        const on = isVisible(prefs, r.key);
        return (
          <button
            key={r.key}
            onClick={() => onChange(r.key, { visible: !on })}
            aria-pressed={on}
            className={`flex shrink-0 snap-start items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition active:scale-95 ${
              on ? "border-transparent bg-card" : "border-card-border text-muted"
            }`}
            style={on ? { boxShadow: `inset 0 0 0 1.5px ${colorFor(prefs, r.key)}` } : undefined}
          >
            <span
              style={{ backgroundColor: colorFor(prefs, r.key) }}
              className={`h-2.5 w-2.5 rounded-full ${on ? "" : "opacity-40"}`}
            />
            {r.label}
          </button>
        );
      })}
      <button
        onClick={onOpenColors}
        className="flex shrink-0 snap-start items-center gap-1.5 rounded-full border border-card-border bg-card px-3 py-1.5 text-xs font-medium text-accent transition active:scale-95"
      >
        {t("cal.colors")}
      </button>
    </div>
  );
}

// The full list, with colors: shown in a sheet.
export default function CourseFilterPanel({
  courses,
  prefs,
  onChange,
}: {
  courses: FilterCourse[];
  prefs: Prefs;
  onChange: (key: string, patch: Partial<Pref>) => void;
}) {
  const { t } = useI18n();
  const rows = useRows(courses);
  const shown = rows.filter((r) => isVisible(prefs, r.key)).length;

  return (
    <div>
      <div className="flex items-center justify-between px-5 pb-1 text-xs">
        <span className="text-muted">{t("cal.filtersShown", { shown, total: rows.length })}</span>
        <span className="flex gap-4 font-medium">
          <button
            onClick={() => rows.forEach((r) => onChange(r.key, { visible: true }))}
            className="text-accent hover:text-accent-hover"
          >
            {t("cal.showAll")}
          </button>
          <button
            onClick={() => rows.forEach((r) => onChange(r.key, { visible: false }))}
            className="text-muted hover:text-foreground"
          >
            {t("cal.hideAll")}
          </button>
        </span>
      </div>
      <div className="divide-y divide-card-border border-t border-card-border">
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
        <p className="border-t border-card-border px-5 py-3 text-xs text-muted">
          {t("cal.noCoursesHint")}
        </p>
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
    <div className="px-5 py-2.5">
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
        <div className="mt-2.5 flex flex-wrap items-center gap-2.5 pl-10">
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
          <ColorSwatchInput
            value={color}
            active={!PALETTE.some((c) => c === color.toLowerCase())}
            onCommit={(c) => {
              onColor(c);
              setPicking(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
