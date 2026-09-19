import type { ReactNode } from "react";

// Shared building blocks: every screen is a stack of cards on the page
// background, the same way the settings page is built.

export const inputClass =
  "block h-11 w-full min-w-0 rounded-xl border border-card-border bg-transparent px-3.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft";

export const cardClass = "rounded-2xl border border-card-border bg-card";

// Page container: a centered column with a card stack inside.
export function Page({
  children,
  width = "max-w-md",
}: {
  children: ReactNode;
  width?: "max-w-md" | "max-w-lg" | "max-w-xl";
}) {
  return (
    <div className={`mx-auto w-full ${width} space-y-4 px-6 pb-6 pt-5`}>{children}</div>
  );
}

// A padded card with vertical spacing between its children.
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`space-y-4 p-4 ${cardClass} ${className}`}>{children}</div>;
}

// A card whose children are rows separated by hairlines (lists of people, etc.).
export function ListCard({ children }: { children: ReactNode }) {
  return (
    <div className={`divide-y divide-card-border overflow-hidden ${cardClass}`}>
      {children}
    </div>
  );
}

// A muted one-line message in a card (empty states).
export function EmptyCard({ children }: { children: ReactNode }) {
  return <div className={`px-4 py-5 text-sm text-muted ${cardClass}`}>{children}</div>;
}

// Small heading above a card.
export function SectionTitle({
  children,
  right,
}: {
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center justify-between px-1">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
        {children}
      </h2>
      {right}
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
