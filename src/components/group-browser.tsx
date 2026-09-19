"use client";

import { useState } from "react";
import GroupCard from "@/components/group-card";
import RefreshButton from "@/components/refresh-button";
import type { Group } from "@/lib/groups";

export type GroupItem = { group: Group; memberCount: number };

export default function GroupBrowser({ items }: { items: GroupItem[] }) {
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState<string | null>(null);

  const courses = Array.from(
    new Set(items.map((i) => i.group.course_code).filter((c): c is string => !!c))
  ).sort();

  // If the selected course disappears after a refresh, fall back to "Alle".
  const activeCourse = course && courses.includes(course) ? course : null;

  const q = query.trim().toLowerCase();
  const visible = items.filter(({ group }) => {
    if (activeCourse && group.course_code !== activeCourse) return false;
    if (!q) return true;
    return [group.name, group.description, group.course_code, group.location]
      .filter(Boolean)
      .some((field) => field!.toLowerCase().includes(q));
  });

  return (
    <section>
      <div className="flex items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Søk i kollokviegrupper"
          className="min-w-0 flex-1 rounded-xl border border-card-border bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
        />
        <RefreshButton label="Oppdater kollokviegrupper" />
      </div>

      {courses.length > 0 && (
        <div className="no-scrollbar -mx-6 mt-3 flex gap-2 overflow-x-auto px-6">
          <Chip active={activeCourse === null} onClick={() => setCourse(null)}>
            Alle
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

      <div className="mt-4 space-y-2">
        {visible.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">
            {items.length === 0
              ? "Ingen offentlige kollokviegrupper ennå."
              : "Ingen kollokviegrupper matcher."}
          </p>
        ) : (
          visible.map(({ group, memberCount }) => (
            <GroupCard key={group.id} group={group} memberCount={memberCount} />
          ))
        )}
      </div>
    </section>
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
