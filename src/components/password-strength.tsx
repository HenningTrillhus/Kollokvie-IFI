"use client";

import type { PasswordCheck } from "@/lib/passwords";
import { useI18n } from "@/lib/i18n/client";

const COLORS = ["transparent", "#ef4444", "#f59e0b", "#22c55e", "#16a34a"];
const LABELS = ["", "pw.weak", "pw.ok", "pw.good", "pw.strong"] as const;

// A thin bar along the bottom edge of a password field (put it inside a
// `relative` wrapper). It grows and changes color as the password improves.
export function StrengthBar({ check }: { check: PasswordCheck }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-x-3 bottom-[3px] h-[3px] overflow-hidden rounded-full"
    >
      <span
        className="block h-full rounded-full transition-[width,background-color] duration-300 ease-out motion-reduce:transition-none"
        style={{ width: `${check.score * 25}%`, backgroundColor: COLORS[check.score] }}
      />
    </span>
  );
}

// "Weak / Fine / Good / Strong", spoken politely to screen readers.
export function StrengthLabel({ check }: { check: PasswordCheck }) {
  const { t } = useI18n();
  return (
    <span
      aria-live="polite"
      className="text-xs font-medium transition-colors"
      style={{ color: check.score ? COLORS[check.score] : undefined }}
    >
      {check.score ? t(LABELS[check.score]) : ""}
    </span>
  );
}
