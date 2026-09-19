import type { ReactNode } from "react";

// Shared building blocks for the longer forms (study group + settings).

export const inputClass =
  "block h-11 w-full min-w-0 rounded-xl border border-card-border bg-transparent px-3.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft";

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4 rounded-2xl border border-card-border bg-card p-4">
      {children}
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

// Pinned to the bottom of the scrolling page, above the tab bar.
export function StickyBar({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-20 -mx-6 border-t border-card-border bg-background/95 px-6 py-3 backdrop-blur">
      {children}
    </div>
  );
}
