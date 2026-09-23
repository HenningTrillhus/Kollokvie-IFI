"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n/client";

// A panel that slides up from the bottom, with its own scrolling content.
// Closing plays the same slide/fade in reverse before actually unmounting,
// so it doesn't just vanish the way the open animation arrives.
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
  const dialog = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  const closed = useRef(false);
  // The latest onClose, without re-running the focus setup on every render.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  // Start the exit animation; its animationend (or, failing that, a fallback
  // timer) calls the real onClose once it's played out.
  const finishClose = useCallback(() => {
    if (closed.current) return;
    closed.current = true;
    closeRef.current();
  }, []);
  const requestClose = useCallback(() => {
    if (closed.current) return;
    setClosing(true);
    window.setTimeout(finishClose, 250);
  }, [finishClose]);

  // Keyboard: Escape closes, Tab stays inside the sheet, and focus returns to
  // whatever opened it.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    dialog.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        requestClose();
        return;
      }
      if (e.key !== "Tab" || !dialog.current) return;
      // Skip anything inside a closed (inert) panel, such as a collapsed time picker.
      const focusable = [
        ...dialog.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ),
      ].filter((el) => !el.closest("[inert]") && el.tabIndex >= 0);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === dialog.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [requestClose]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center ${closing ? "pointer-events-none" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        aria-label={t("common.close")}
        onClick={requestClose}
        className={closing ? "animate-fade-out-only absolute inset-0 bg-black/40" : "animate-fade-only absolute inset-0 bg-black/40"}
      />
      <div
        ref={dialog}
        tabIndex={-1}
        onAnimationEnd={(e) => {
          if (closing && e.target === e.currentTarget) finishClose();
        }}
        className={`relative flex ${tall ? "h-[94%]" : "max-h-[80%]"} w-full max-w-xl flex-col rounded-t-3xl border border-b-0 border-card-border bg-card pb-[env(safe-area-inset-bottom)] shadow-2xl outline-none ${
          closing ? "animate-sheet-down" : "animate-sheet-up"
        }`}
      >
        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <span aria-hidden className="absolute left-1/2 top-2 h-1 w-9 -translate-x-1/2 rounded-full bg-card-border" />
          <h2 className="text-base font-semibold">{title}</h2>
          <button
            onClick={requestClose}
            className="rounded-lg px-2 py-1 text-sm font-medium text-accent transition hover:bg-accent-soft active:scale-95"
          >
            {t("common.close")}
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  );
}
