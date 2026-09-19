"use client";

import { useEffect, useRef, useState, type FormEvent, type TouchEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  daysInMonth,
  firstWeekdayMondayIndex,
  toDateKey,
  EVENT_TYPE_COLORS,
  EVENT_TYPE_LABELS,
  type CalendarEvent,
  type EventType,
} from "@/lib/events";
import type { Group } from "@/lib/groups";

const WEEKDAY_LABELS = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const MONTH_LABELS = [
  "Januar",
  "Februar",
  "Mars",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Desember",
];
const GROUP_SESSION_COLOR = "#3f6f5e";

const today = new Date();
const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());

export default function MonthCalendar({ currentUserId }: { currentUserId: string }) {
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [groupSessions, setGroupSessions] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<EventType>("exam");
  const [saving, setSaving] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  function handleTouchStart(e: TouchEvent) {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }

  function handleTouchEnd(e: TouchEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      changeMonth(dx < 0 ? 1 : -1);
    }
  }

  // Kollokviegruppene dine endrer seg sjelden, så denne hentes én gang, ikke
  // på nytt for hver måned du blar til.
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("group_members")
        .select("groups(*)")
        .eq("user_id", currentUserId);

      const groups = (data ?? [])
        .map((row) => (row as unknown as { groups: Group | null }).groups)
        .filter((g): g is Group => g !== null && g.event_date !== null);
      setGroupSessions(groups);
    })();
  }, [currentUserId]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const supabase = createClient();
      const start = toDateKey(year, month, 1);
      const end = toDateKey(year, month, daysInMonth(year, month));
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", currentUserId)
        .gte("event_date", start)
        .lte("event_date", end)
        .order("event_date", { ascending: true });

      setEvents((data ?? []) as CalendarEvent[]);
      setLoading(false);
    })();
  }, [year, month, currentUserId]);

  function changeMonth(delta: number) {
    let nextMonth = month + delta;
    let nextYear = year;
    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    } else if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
    setMonth(nextMonth);
    setYear(nextYear);
    setSelectedDate(null);
  }

  async function addEvent(event: FormEvent) {
    event.preventDefault();
    const title = newTitle.trim();
    if (!selectedDate || !title) return;

    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("events")
      .insert({ user_id: currentUserId, title, event_date: selectedDate, type: newType })
      .select()
      .single();

    setSaving(false);
    if (!error && data) {
      setEvents((prev) =>
        [...prev, data as CalendarEvent].sort((a, b) =>
          a.event_date.localeCompare(b.event_date)
        )
      );
      setNewTitle("");
    }
  }

  async function deleteEvent(id: string) {
    const supabase = createClient();
    await supabase.from("events").delete().eq("id", id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  const leadingBlanks = firstWeekdayMondayIndex(year, month);
  const totalDays = daysInMonth(year, month);
  const cells: (number | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsByDate = new Map<string, CalendarEvent[]>();
  events.forEach((e) => {
    const list = eventsByDate.get(e.event_date) ?? [];
    list.push(e);
    eventsByDate.set(e.event_date, list);
  });

  const sessionsByDate = new Map<string, Group[]>();
  groupSessions.forEach((g) => {
    if (!g.event_date) return;
    const list = sessionsByDate.get(g.event_date) ?? [];
    list.push(g);
    sessionsByDate.set(g.event_date, list);
  });

  const selectedEvents = selectedDate ? eventsByDate.get(selectedDate) ?? [] : [];
  const selectedSessions = selectedDate ? sessionsByDate.get(selectedDate) ?? [] : [];

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => changeMonth(-1)}
          aria-label="Forrige måned"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-accent-soft hover:text-foreground"
        >
          ‹
        </button>
        <h1 className="text-lg font-semibold">
          {MONTH_LABELS[month]} {year}
        </h1>
        <button
          onClick={() => changeMonth(1)}
          aria-label="Neste måned"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-accent-soft hover:text-foreground"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-muted">
        {WEEKDAY_LABELS.map((day) => (
          <div key={day} className="pb-1">
            {day}
          </div>
        ))}
      </div>

      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`grid touch-pan-y grid-cols-7 gap-1.5 transition-opacity ${loading ? "opacity-50" : ""}`}
      >
        {cells.map((day, index) => {
          if (day === null) return <div key={index} />;
          const dateKey = toDateKey(year, month, day);
          const dayEvents = eventsByDate.get(dateKey) ?? [];
          const daySessions = sessionsByDate.get(dateKey) ?? [];
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === selectedDate;

          return (
            <button
              key={dateKey}
              onClick={() => setSelectedDate(dateKey)}
              className={`flex aspect-square flex-col items-center gap-1 rounded-xl border p-1.5 text-sm transition ${
                isSelected
                  ? "border-accent bg-accent-soft"
                  : "border-card-border hover:bg-accent-soft/60"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                  isToday ? "bg-accent font-semibold text-white" : ""
                }`}
              >
                {day}
              </span>
              <div className="flex flex-wrap justify-center gap-0.5">
                {daySessions.slice(0, 1).map((g) => (
                  <span
                    key={g.id}
                    style={{ backgroundColor: GROUP_SESSION_COLOR }}
                    className="h-1.5 w-1.5 rounded-full"
                  />
                ))}
                {dayEvents.slice(0, 3).map((e) => (
                  <span
                    key={e.id}
                    style={{ backgroundColor: EVENT_TYPE_COLORS[e.type] }}
                    className="h-1.5 w-1.5 rounded-full"
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <section className="mt-8 rounded-2xl border border-card-border p-5">
        {selectedDate ? (
          <>
            <h2 className="text-sm font-semibold">
              {Number(selectedDate.split("-")[2])}. {MONTH_LABELS[month].toLowerCase()}
            </h2>

            {(selectedSessions.length > 0 || selectedEvents.length > 0) && (
              <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto overscroll-contain">
                {selectedSessions.map((g) => (
                  <li key={g.id}>
                    <Link
                      href={`/groups/${g.id}`}
                      className="flex items-center gap-3 rounded-xl border border-card-border px-3 py-2 transition hover:bg-accent-soft"
                    >
                      <span
                        style={{ backgroundColor: GROUP_SESSION_COLOR }}
                        className="h-2 w-2 shrink-0 rounded-full"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{g.name}</p>
                        <p className="text-xs text-muted">
                          Kollokviegruppe
                          {g.event_time ? ` · ${g.event_time.slice(0, 5)}` : ""}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
                {selectedEvents.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-card-border px-3 py-2"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        style={{ backgroundColor: EVENT_TYPE_COLORS[e.type] }}
                        className="h-2 w-2 shrink-0 rounded-full"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{e.title}</p>
                        <p className="text-xs text-muted">{EVENT_TYPE_LABELS[e.type]}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteEvent(e.id)}
                      aria-label="Slett hendelse"
                      className="shrink-0 text-xs text-muted transition hover:text-red-500"
                    >
                      Slett
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={addEvent} className="mt-4 flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Ny hendelse…"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-card-border bg-transparent px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
              />
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as EventType)}
                className="rounded-xl border border-card-border bg-transparent px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
              >
                <option value="exam">Eksamen</option>
                <option value="deadline">Innlevering</option>
                <option value="other">Annet</option>
              </select>
              <button
                type="submit"
                disabled={saving || !newTitle.trim()}
                className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
              >
                {saving ? "Legger til…" : "Legg til"}
              </button>
            </form>
          </>
        ) : (
          <p className="text-sm text-muted">
            Klikk på en dag for å se eller legge til hendelser, som eksamener og
            innleveringer. Kollokviegruppene dine dukker automatisk opp på sin dato.
          </p>
        )}
      </section>
    </div>
  );
}
