"use client";

import { useI18n } from "@/lib/i18n/client";

// The round "done" button. Fills green with a check when done.
export default function DoneCheck({
  done,
  onToggle,
  className = "h-7 w-7",
}: {
  done: boolean;
  onToggle: (source: HTMLElement) => void;
  className?: string;
}) {
  const { t } = useI18n();

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-label={done ? t("cal.markUndone") : t("cal.markDone")}
      onClick={(e) => {
        e.stopPropagation();
        onToggle(e.currentTarget);
      }}
      className={`flex shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 active:scale-90 ${className} ${
        done
          ? "border-green-500 bg-green-500 text-white"
          : "border-card-border text-transparent hover:border-green-500/60"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`h-[60%] w-[60%] ${done ? "animate-check-pop" : ""}`}
      >
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </button>
  );
}
