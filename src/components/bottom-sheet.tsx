"use client";

import { useEffect, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n/client";

// A panel that slides up from the bottom, with its own scrolling content.
export default function BottomSheet({
  title,
  onClose,
  tall = false,
  children,
}: {
  title: string;
  onClose: () => void;
  // A tall sheet covers most of the screen (for forms).
  tall?: boolean;
  children: ReactNode;
}) {
  const { t } = useI18n();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <button
        aria-label={t("common.close")}
        onClick={onClose}
        className="animate-fade-only absolute inset-0 bg-black/40"
      />
      <div className={`animate-sheet-up relative flex ${tall ? "h-[94%]" : "max-h-[80%]"} w-full max-w-xl flex-col rounded-t-3xl border border-b-0 border-card-border bg-card pb-[env(safe-area-inset-bottom)] shadow-2xl`}>
        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <span aria-hidden className="absolute left-1/2 top-2 h-1 w-9 -translate-x-1/2 rounded-full bg-card-border" />
          <h2 className="text-base font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-medium text-accent transition hover:bg-accent-soft"
          >
            {t("common.close")}
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  );
}
