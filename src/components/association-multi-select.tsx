"use client";

import { useEffect, useRef, useState } from "react";
import { ASSOCIATIONS, associationBySlug, type UserAssociation } from "@/lib/associations";
import { inputClass } from "@/components/form-ui";
import { useI18n } from "@/lib/i18n/client";

const TITLE_MAX = 40;

// Pick any number of associations and give each its own short title ("Intern",
// "Funk", "Styreleder" ...). Not yet picked ones list in the fixed order from
// lib/associations.ts unless you search.
export default function AssociationMultiSelect({
  selected,
  onChange,
}: {
  selected: UserAssociation[];
  onChange: (list: UserAssociation[]) => void;
}) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const focusSlug = useRef<string | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Focus the title box of whichever association was just added.
  useEffect(() => {
    if (!focusSlug.current) return;
    titleRefs.current[focusSlug.current]?.focus();
    focusSlug.current = null;
  }, [selected]);

  const selectedSlugs = new Set(selected.map((a) => a.association));
  const trimmed = query.trim().toLowerCase();
  const notPicked = ASSOCIATIONS.filter((a) => !selectedSlugs.has(a.slug));
  const filtered = trimmed ? notPicked.filter((a) => a.name.toLowerCase().includes(trimmed)) : notPicked;

  function add(slug: string) {
    onChange([...selected, { association: slug, title: "" }]);
    setQuery("");
    setOpen(false);
    focusSlug.current = slug;
  }

  function remove(slug: string) {
    onChange(selected.filter((a) => a.association !== slug));
  }

  function setTitle(slug: string, title: string) {
    onChange(selected.map((a) => (a.association === slug ? { ...a, title } : a)));
  }

  return (
    <div className="space-y-3">
      {selected.length > 0 && (
        <ul className="space-y-2">
          {selected.map((item) => {
            const meta = associationBySlug(item.association);
            if (!meta) return null;
            return (
              <li
                key={item.association}
                className="flex items-center gap-3 rounded-xl border border-card-border p-2"
              >
                <span className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-accent-soft">
                  {/* eslint-disable-next-line @next/next/no-img-element -- small static logos */}
                  <img src={meta.icon} alt="" className="h-full w-full object-contain" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-muted">{meta.name}</p>
                  <input
                    ref={(el) => {
                      titleRefs.current[item.association] = el;
                    }}
                    type="text"
                    maxLength={TITLE_MAX}
                    placeholder={t("association.titlePlaceholder")}
                    value={item.title}
                    onChange={(e) => setTitle(item.association, e.target.value)}
                    className="mt-0.5 w-full rounded-lg border border-card-border bg-transparent px-2 py-1 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => remove(item.association)}
                  aria-label={t("association.remove", { name: meta.name })}
                  className="shrink-0 rounded-lg p-1.5 text-muted transition hover:bg-red-500/10 hover:text-red-500"
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div ref={containerRef} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={t("association.searchPlaceholder")}
          aria-label={t("association.searchPlaceholder")}
          className={inputClass}
        />

        {open && (
          <div className="animate-pop absolute z-10 mt-1.5 max-h-72 w-full overflow-y-auto rounded-xl border border-card-border bg-card shadow-lg">
            {filtered.map((a) => (
              <button
                key={a.slug}
                type="button"
                onClick={() => add(a.slug)}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition hover:bg-accent-soft"
              >
                <span className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-accent-soft">
                  {/* eslint-disable-next-line @next/next/no-img-element -- small static logos */}
                  <img src={a.icon} alt="" className="h-full w-full object-contain" />
                </span>
                {a.name}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-3 text-sm text-muted">{t("association.noMatches")}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
