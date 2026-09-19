"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { addCustomCourse, COURSE_CODE_PATTERN, type Course } from "@/lib/courses";
import { useI18n } from "@/lib/i18n/client";

export default function CourseSingleSelect({
  value,
  onChange,
  priorityCodes = [],
}: {
  value: Course | null;
  onChange: (course: Course | null) => void;
  priorityCodes?: string[];
}) {
  const { t } = useI18n();
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [addingCustom, setAddingCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("courses").select("*").order("code");
      setAllCourses((data ?? []) as Course[]);
    })();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setAddingCustom(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const trimmed = query.trim();
  const filteredAll = allCourses.filter(
    (c) =>
      c.code.toLowerCase().includes(trimmed.toLowerCase()) ||
      c.name.toLowerCase().includes(trimmed.toLowerCase())
  );

  const sorted = trimmed
    ? filteredAll
    : [...filteredAll].sort((a, b) => {
        const aPriority = priorityCodes.includes(a.code) ? 0 : 1;
        const bPriority = priorityCodes.includes(b.code) ? 0 : 1;
        return aPriority - bPriority || a.code.localeCompare(b.code);
      });

  const exactMatch = allCourses.some(
    (c) => c.code.toLowerCase() === trimmed.toLowerCase()
  );

  function select(course: Course) {
    onChange(course);
    setQuery("");
    setOpen(false);
    setAddingCustom(false);
  }

  async function submitCustom() {
    if (!trimmed || !customName.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const course = await addCustomCourse(supabase, trimmed, customName);
    setSaving(false);
    if (course) {
      setAllCourses((prev) =>
        prev.some((c) => c.code === course.code) ? prev : [...prev, course]
      );
      select(course);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-card-border bg-transparent px-4 py-2.5 text-left text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
      >
        <span className={value ? "" : "text-muted"}>
          {value ? `${value.code} – ${value.name}` : t("course.choose")}
        </span>
        <span className="text-muted">⌄</span>
      </button>

      {open && (
        <div className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-xl border border-card-border bg-card shadow-lg">
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setAddingCustom(false);
            }}
            placeholder={t("course.searchPlaceholder")}
            className="w-full border-b border-card-border bg-transparent px-4 py-2 text-sm outline-none"
          />
          <div className="max-h-64 overflow-y-auto">
            {sorted.slice(0, 30).map((course) => (
              <button
                key={course.code}
                type="button"
                onClick={() => select(course)}
                className="flex w-full flex-col items-start px-4 py-2 text-left text-sm transition hover:bg-accent-soft"
              >
                <span className="font-medium">{course.code}</span>
                <span className="text-xs text-muted">{course.name}</span>
              </button>
            ))}
            {sorted.length === 0 && (
              <p className="px-4 py-3 text-sm text-muted">{t("course.noMatch")}</p>
            )}
          </div>

          {trimmed && !exactMatch && (
            <div className="border-t border-card-border p-3">
              {!COURSE_CODE_PATTERN.test(trimmed) ? (
                <p className="text-xs text-muted">{t("course.invalidCode")}</p>
              ) : addingCustom ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted">
                    {t("course.addHint", { code: trimmed.toUpperCase() })}
                  </p>
                  <input
                    type="text"
                    autoFocus
                    placeholder={t("course.customName")}
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full rounded-lg border border-card-border bg-transparent px-3 py-1.5 text-sm outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={submitCustom}
                    disabled={saving || !customName.trim()}
                    className="w-full rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
                  >
                    {saving ? t("course.adding") : t("course.addSubmit")}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingCustom(true)}
                  className="text-sm font-medium text-accent hover:text-accent-hover"
                >
                  {t("course.addLink", { code: trimmed.toUpperCase() })}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
