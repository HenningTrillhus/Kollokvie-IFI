"use client";

import { useState } from "react";
import GroupCard from "@/components/group-card";
import RefreshButton from "@/components/refresh-button";
import { Card, EmptyCard, inputClass } from "@/components/form-ui";
import type { GroupCardData } from "@/lib/groups";
import { useI18n } from "@/lib/i18n/client";

export default function GroupBrowser({ items }: { items: GroupCardData[] }) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<"all" | "public" | "private">("all");

  const courses = Array.from(
    new Set(items.map((i) => i.group.course_code).filter((c): c is string => !!c))
  ).sort();

  // If the selected course disappears after a refresh, fall back to "Alle".
  const activeCourse = course && courses.includes(course) ? course : null;

  const q = query.trim().toLowerCase();
  const visible = items.filter(({ group }) => {
    if (visibility !== "all" && group.visibility !== visibility) return false;
    if (activeCourse && group.course_code !== activeCourse) return false;
    if (!q) return true;
    return [group.name, group.description, group.course_code, group.location]
      .filter(Boolean)
      .some((field) => field!.toLowerCase().includes(q));
  });

  return (
    <>
      <Card>
        <div className="flex items-center gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("explore.searchPlaceholder")}
            className={inputClass}
          />
          <RefreshButton label={t("explore.refresh")} />
        </div>

        <div className="grid grid-cols-3 rounded-xl border border-card-border p-1 text-sm font-medium">
          {(
            [
              ["all", t("explore.all")],
              ["public", t("explore.onlyPublic")],
              ["private", t("explore.onlyPrivate")],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setVisibility(value)}
              className={`rounded-lg px-3 py-1.5 transition ${
                visibility === value ? "bg-accent text-white" : "text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {courses.length > 0 && (
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
            <Chip active={activeCourse === null} onClick={() => setCourse(null)}>
              {t("explore.all")}
            </Chip>
            {courses.map((code) => (
              <Chip
                key={code}
                active={activeCourse === code}
                onClick={() => setCourse(activeCourse === code ? null : code)}
              >
                {code}
              </Chip>
            ))}
          </div>
        )}
      </Card>

      {visible.length === 0 ? (
        <EmptyCard>
          {visibility === "private" && items.every((i) => i.group.visibility !== "private")
            ? t("explore.noPrivate")
            : items.length === 0
              ? t("explore.empty")
              : t("explore.noMatch")}
        </EmptyCard>
      ) : (
        <div className="space-y-3">
          {visible.map(({ group, memberCount, members }, i) => (
            <GroupCard
              key={group.id}
              group={group}
              memberCount={memberCount}
              members={members}
              index={i}
            />
          ))}
        </div>
      )}
    </>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition active:scale-95 ${
        active
          ? "border-accent bg-accent text-white"
          : "border-card-border text-muted hover:border-accent/40"
      }`}
    >
      {children}
    </button>
  );
}
