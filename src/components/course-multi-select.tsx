"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { addCustomCourse, COURSE_CODE_PATTERN, type Course } from "@/lib/courses";
import { useI18n } from "@/lib/i18n/client";

export default function CourseMultiSelect({
  selected,
  onChange,
}: {
  selected: Course[];
  onChange: (courses: Course[]) => void;
}) {
  const { t } = useI18n();
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [addingCustom, setAddingCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("courses").select("*").order("code");
      setAllCourses((data ?? []) as Course[]);
    })();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setAddingCustom(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedCodes = new Set(selected.map((c) => c.code));
  const trimmed = query.trim();
  const filtered = allCourses
    .filter(
      (c) =>
        !selectedCodes.has(c.code) &&
        (c.code.toLowerCase().includes(trimmed.toLowerCase()) ||
          c.name.toLowerCase().includes(trimmed.toLowerCase()))
    )
    .slice(0, 30);

  const exactMatch = allCourses.some(
    (c) => c.code.toLowerCase() === trimmed.toLowerCase()
  );

  function addCourse(course: Course) {
    onChange([...selected, course]);
    setQuery("");
    setAddingCustom(false);
    setCustomName("");
  }

  function removeCourse(code: string) {
    onChange(selected.filter((c) => c.code !== code));
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
      addCourse(course);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selected.map((c) => (
            <span
              key={c.code}
              title={c.name}
              className="flex items-center gap-1.5 rounded-lg bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent"
            >
              {c.code}
              <button
                type="button"
                onClick={() => removeCourse(c.code)}
                aria-label={t("course.remove", { code: c.code })}
                className="text-accent/70 hover:text-accent"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setAddingCustom(false);
        }}
        onFocus={() => setOpen(true)}
        placeholder={t("course.searchPlaceholder")}
        aria-label={t("course.searchPlaceholder")}
        className="w-full rounded-xl border border-card-border bg-transparent h-11 px-3.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
      />

      {open && (
        <div className="animate-pop absolute z-10 mt-1.5 max-h-72 w-full overflow-y-auto rounded-xl border border-card-border bg-card shadow-lg">
          {filtered.map((course) => (
            <button
              key={course.code}
              type="button"
              onClick={() => addCourse(course)}
              className="flex w-full flex-col items-start px-4 py-2 text-left text-sm transition hover:bg-accent-soft"
            >
              <span className="font-medium">{course.code}</span>
              <span className="text-xs text-muted">{course.name}</span>
            </button>
          ))}

          {filtered.length === 0 && !trimmed && (
            <p className="px-4 py-3 text-sm text-muted">{t("course.typeToSearch")}</p>
          )}

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
                    aria-label={t("course.customName")}
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
