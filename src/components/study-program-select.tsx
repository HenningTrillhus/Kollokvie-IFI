"use client";

import { useEffect, useRef, useState } from "react";

export default function StudyProgramSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
}) {
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
    option.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-card-border bg-transparent px-4 py-2.5 text-left text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
      >
        <span className={value ? "" : "text-muted"}>{value || "Ikke valgt"}</span>
        <span className="text-muted">⌄</span>
      </button>

      {open && (
        <div className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-xl border border-card-border bg-card shadow-lg">
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Søk…"
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
              Ikke valgt
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
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
