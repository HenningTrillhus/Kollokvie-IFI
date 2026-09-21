"use client";

import { useEffect, useId, useRef, useState } from "react";
import Collapsible from "@/components/collapsible";
import { daysInMonth, firstWeekdayMondayIndex, toDateKey } from "@/lib/events";
import { useI18n } from "@/lib/i18n/client";
import { localeFor } from "@/lib/i18n";

const nav =
  "flex h-8 w-8 items-center justify-center rounded-lg text-lg text-muted transition hover:bg-accent-soft hover:text-foreground active:scale-90";

function parseKey(key: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  return m ? { y: Number(m[1]), m: Number(m[2]) - 1, d: Number(m[3]) } : null;
}

// "22.09.2026" from "2026-09-22".
function toDMY(key: string) {
  const p = parseKey(key);
  return p ? `${String(p.d).padStart(2, "0")}.${String(p.m + 1).padStart(2, "0")}.${p.y}` : "";
}

// Turns what someone typed ("22.09.2026", "22/9/26", "22092026") into a date
// key, or null if it is not a real date.
function parseTyped(text: string): string | null {
  const parts = text.trim().split(/[^\d]+/).filter(Boolean);
  let d: number, m: number, y: number;
  if (parts.length === 3) {
    [d, m, y] = parts.map(Number);
  } else if (parts.length === 1 && /^\d{8}$/.test(parts[0])) {
    d = Number(parts[0].slice(0, 2));
    m = Number(parts[0].slice(2, 4));
    y = Number(parts[0].slice(4));
  } else return null;
  if (y < 100) y += 2000;
  if (y < 1990 || y > 2100 || m < 1 || m > 12 || d < 1 || d > daysInMonth(y, m - 1)) return null;
  return toDateKey(y, m - 1, d);
}

// The app's own date picker (no browser controls): a button that opens a small
// month calendar plus a box where you can type the date. Value is "YYYY-MM-DD".
export default function DatePicker({
  value,
  onChange,
  large = false,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  large?: boolean;
  id?: string;
}) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const panel = useRef<HTMLDivElement>(null);

  const now = new Date();
  const todayKey = toDateKey(now.getFullYear(), now.getMonth(), now.getDate());
  const selected = parseKey(value);
  // The month on show. It follows the chosen date, but you can browse away.
  const [view, setView] = useState(() => ({
    y: selected?.y ?? now.getFullYear(),
    m: selected?.m ?? now.getMonth(),
  }));
  // Text being typed, until it forms a valid date.
  const [draft, setDraft] = useState<string | null>(null);

  // Slide fully into view once opened (inside a sheet it would sit below the fold).
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(
      () => panel.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }),
      330
    );
    return () => clearTimeout(timer);
  }, [open]);

  const monthNames = t("cal.months").split("|");
  const weekdays = t("cal.weekdays").split("|");
  const cells: (number | null)[] = [
    ...Array(firstWeekdayMondayIndex(view.y, view.m)).fill(null),
    ...Array.from({ length: daysInMonth(view.y, view.m) }, (_, i) => i + 1),
  ];

  function shift(delta: number) {
    setView(({ y, m }) => {
      const next = m + delta;
      return next < 0
        ? { y: y - 1, m: 11 }
        : next > 11
          ? { y: y + 1, m: 0 }
          : { y, m: next };
    });
  }

  function choose(key: string) {
    onChange(key);
    setDraft(null);
    const p = parseKey(key);
    if (p) setView({ y: p.y, m: p.m });
  }

  const label = selected
    ? new Date(selected.y, selected.m, selected.d).toLocaleDateString(localeFor(lang), {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : t("date.choose");

  const typedText = draft ?? toDMY(value);
  const typedInvalid = draft !== null && draft.trim() !== "" && parseTyped(draft) === null;

  return (
    <div
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          // Close only the picker, not a sheet around it (see TimePicker).
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
          setOpen(false);
        }
      }}
    >
      <button
        id={id}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-transparent text-left outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft ${
          open ? "border-accent" : "border-card-border"
        } ${large ? "h-11 px-4 text-base sm:h-12" : "h-11 px-3.5 text-sm"}`}
      >
        <span className={`truncate ${value ? "font-medium" : "text-muted"}`}>{label}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className="h-4 w-4 shrink-0 text-muted"
          aria-hidden
        >
          <rect x="4" y="5" width="16" height="15" rx="2.5" />
          <path d="M8 3v4M16 3v4M4 10h16" strokeLinecap="round" />
        </svg>
      </button>

      <div id={panelId}>
        <Collapsible open={open}>
          <div
            ref={panel}
            className="mt-2 space-y-2 rounded-xl border border-card-border bg-card p-3 shadow-sm"
          >
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              aria-label={t("date.type")}
              aria-invalid={typedInvalid}
              placeholder={t("date.typePlaceholder")}
              value={typedText}
              onChange={(e) => {
                const text = e.target.value;
                const key = parseTyped(text);
                if (key) choose(key);
                else setDraft(text);
              }}
              onBlur={() => setDraft(null)}
              className={`h-10 w-full rounded-lg border bg-transparent px-3 text-sm tabular-nums outline-none transition focus:ring-2 focus:ring-accent-soft ${
                typedInvalid ? "border-red-500" : "border-card-border focus:border-accent"
              }`}
            />

            <div className="flex items-center justify-between">
              <button type="button" onClick={() => shift(-1)} aria-label={t("cal.prevMonth")} className={nav}>
                ‹
              </button>
              <p className="text-sm font-semibold" aria-live="polite">
                {monthNames[view.m]} {view.y}
              </p>
              <button type="button" onClick={() => shift(1)} aria-label={t("cal.nextMonth")} className={nav}>
                ›
              </button>
            </div>

            <div className="grid grid-cols-7 gap-0.5 text-center">
              {weekdays.map((d) => (
                <span key={d} className="pb-1 text-[11px] font-medium text-muted">
                  {d}
                </span>
              ))}
              {cells.map((day, i) => {
                if (day === null) return <span key={i} />;
                const key = toDateKey(view.y, view.m, day);
                const isSelected = key === value;
                const isToday = key === todayKey;
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => choose(key)}
                    className={`h-9 rounded-lg text-sm tabular-nums transition active:scale-90 ${
                      isSelected
                        ? "bg-accent font-semibold text-white"
                        : isToday
                          ? "font-semibold text-accent ring-1 ring-accent/50 hover:bg-accent-soft"
                          : "hover:bg-accent-soft"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => choose(todayKey)}
                className="h-9 rounded-lg border border-card-border text-xs font-medium text-muted transition hover:bg-accent-soft hover:text-foreground active:scale-[0.98]"
              >
                {t("cal.today")}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-9 rounded-lg bg-accent text-xs font-medium text-white transition hover:bg-accent-hover active:scale-[0.98]"
              >
                {t("time.done")}
              </button>
            </div>
          </div>
        </Collapsible>
      </div>
    </div>
  );
}
