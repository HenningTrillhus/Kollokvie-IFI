"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import Collapsible from "@/components/collapsible";
import { ClockIcon } from "@/components/meta-icons";
import { useI18n } from "@/lib/i18n/client";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const QUARTERS = ["00", "15", "30", "45"];
const EVERY_MINUTE = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

// The app's own time picker (no browser controls): a button that opens two
// scrollable columns, hours and minutes. Value is "HH:MM", or "" for no time.
export default function TimePicker({
  value,
  onChange,
  anyMinute = false,
  large = false,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  // Every minute (00-59), or only quarters (00, 15, 30, 45).
  anyMinute?: boolean;
  // Bigger trigger for the thumb-sized forms.
  large?: boolean;
  id?: string;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const hourList = useRef<HTMLDivElement>(null);
  const minuteList = useRef<HTMLDivElement>(null);

  const [hour = "", minute = ""] = value ? value.slice(0, 5).split(":") : [];
  // A time saved earlier keeps its odd minute as an option.
  const minutes = anyMinute
    ? EVERY_MINUTE
    : minute && !QUARTERS.includes(minute)
      ? [...QUARTERS, minute].sort()
      : QUARTERS;

  // When the panel opens, bring the chosen hour and minute into view.
  useEffect(() => {
    if (!open) return;
    for (const list of [hourList.current, minuteList.current]) {
      const chosen = list?.querySelector<HTMLElement>('[aria-selected="true"]');
      if (list && chosen) {
        list.scrollTop = chosen.offsetTop - list.clientHeight / 2 + chosen.clientHeight / 2;
      }
    }
    // Once the panel has slid open, make sure all of it is on screen (in a sheet
    // it would otherwise sit half below the fold and need scrolling).
    const timer = setTimeout(
      () => panel.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }),
      330
    );
    return () => clearTimeout(timer);
  }, [open]);

  function pickHour(h: string) {
    onChange(`${h}:${minute || "00"}`);
  }
  function pickMinute(m: string) {
    onChange(`${hour || "12"}:${m}`);
  }

  // Arrow keys move through a column; Home/End jump to the ends.
  function handleKeys(
    e: KeyboardEvent<HTMLDivElement>,
    options: string[],
    current: string,
    pick: (v: string) => void
  ) {
    const index = options.indexOf(current);
    let next = -1;
    if (e.key === "ArrowDown") next = Math.min(options.length - 1, index + 1);
    else if (e.key === "ArrowUp") next = Math.max(0, index < 0 ? 0 : index - 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = options.length - 1;
    else return;
    e.preventDefault();
    pick(options[next]);
    // Keep focus on the newly chosen option once it has re-rendered.
    const list = e.currentTarget;
    requestAnimationFrame(() => {
      const el = list.querySelector<HTMLElement>('[aria-selected="true"]');
      el?.focus();
      el?.scrollIntoView({ block: "nearest" });
    });
  }

  const option = (selected: boolean) =>
    `h-8 w-full shrink-0 rounded-lg text-sm sm:h-9 font-medium tabular-nums transition ${
      selected ? "bg-accent text-white" : "text-foreground hover:bg-accent-soft"
    }`;

  return (
    <div
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          // Close only the picker. (React listens on the document itself, like
          // the sheet does, so the sheet's listener has to be stopped explicitly.)
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
        <span className={value ? "font-medium tabular-nums" : "text-muted"}>
          {value ? value.slice(0, 5) : t("time.choose")}
        </span>
        <ClockIcon className="h-4 w-4 shrink-0 text-muted" />
      </button>

      <div id={panelId}>
        <Collapsible open={open}>
          <div
            ref={panel}
            className="mt-2 rounded-xl border border-card-border bg-card p-2 shadow-sm"
          >
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {t("time.hour")}
                </p>
                <div
                  ref={hourList}
                  role="listbox"
                  aria-label={t("time.hour")}
                  onKeyDown={(e) => handleKeys(e, HOURS, hour, pickHour)}
                  className="relative max-h-36 space-y-0.5 overflow-y-auto overscroll-contain rounded-lg sm:max-h-44"
                >
                  {HOURS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      role="option"
                      aria-selected={h === hour}
                      tabIndex={h === hour || (!hour && h === HOURS[0]) ? 0 : -1}
                      onClick={() => pickHour(h)}
                      className={option(h === hour)}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {t("time.minute")}
                </p>
                <div
                  ref={minuteList}
                  role="listbox"
                  aria-label={t("time.minute")}
                  onKeyDown={(e) => handleKeys(e, minutes, minute, pickMinute)}
                  className="relative max-h-36 space-y-0.5 overflow-y-auto overscroll-contain rounded-lg sm:max-h-44"
                >
                  {minutes.map((m) => (
                    <button
                      key={m}
                      type="button"
                      role="option"
                      aria-selected={m === minute}
                      tabIndex={m === minute || (!minute && m === minutes[0]) ? 0 : -1}
                      onClick={() => pickMinute(m)}
                      className={option(m === minute)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={!value}
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="h-9 rounded-lg border border-card-border text-xs font-medium text-muted transition hover:bg-accent-soft hover:text-foreground active:scale-[0.98] disabled:opacity-40"
              >
                {t("time.clear")}
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
