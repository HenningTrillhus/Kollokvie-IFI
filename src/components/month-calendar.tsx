"use client";

import { useEffect, useState, type FormEvent } from "react";
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

const today = new Date();
const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());

export default function MonthCalendar() {
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<EventType>("exam");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const start = toDateKey(year, month, 1);
      const end = toDateKey(year, month, daysInMonth(year, month));
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", user.id)
        .gte("event_date", start)
        .lte("event_date", end)
        .order("event_date", { ascending: true });

      setEvents((data ?? []) as CalendarEvent[]);
      setLoading(false);
    })();
  }, [year, month]);

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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("events")
      .insert({ user_id: user.id, title, event_date: selectedDate, type: newType })
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

  const selectedEvents = selectedDate ? eventsByDate.get(selectedDate) ?? [] : [];

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
        className={`grid grid-cols-7 gap-1.5 transition-opacity ${loading ? "opacity-50" : ""}`}
      >
        {cells.map((day, index) => {
          if (day === null) return <div key={index} />;
          const dateKey = toDateKey(year, month, day);
          const dayEvents = eventsByDate.get(dateKey) ?? [];
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

            {selectedEvents.length > 0 && (
              <ul className="mt-3 space-y-2">
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
            innleveringer.
          </p>
        )}
      </section>
    </div>
  );
}
