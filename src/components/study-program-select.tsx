"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { programLabel } from "@/lib/i18n";

export default function StudyProgramSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
}) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = options.filter((option) =>
    [option, programLabel(lang, option)].some((label) =>
      label.toLowerCase().includes(query.trim().toLowerCase())
    )
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-card-border bg-transparent h-11 px-3.5 text-left text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
      >
        <span className={value ? "" : "text-muted"}>{value ? programLabel(lang, value) : t("common.notSelected")}</span>
        <span className="text-muted">⌄</span>
      </button>

      {open && (
        <div className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-xl border border-card-border bg-card shadow-lg">
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("select.search")}
            aria-label={t("select.search")}
            className="w-full border-b border-card-border bg-transparent px-4 py-2 text-sm outline-none"
          />
          <div className="max-h-64 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
                setQuery("");
              }}
              className="block w-full px-4 py-2 text-left text-sm text-muted transition hover:bg-accent-soft"
            >
              {t("common.notSelected")}
            </button>
            {filtered.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                  setQuery("");
                }}
                className={`block w-full px-4 py-2 text-left text-sm transition hover:bg-accent-soft ${
                  value === option ? "bg-accent-soft text-accent" : ""
                }`}
              >
                {programLabel(lang, option)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
