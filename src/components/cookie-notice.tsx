"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useI18n } from "@/lib/i18n/client";

const STORAGE_KEY = "kollokvie:cookie-notice";
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function dismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

// We only use strictly necessary cookies, which need no consent, so this is
// an information notice with a single "OK", not a fake choice. If analytics or
// marketing cookies are ever added, replace it with a real accept/decline
// banner (equal prominence) that blocks them until consent is given.
export default function CookieNotice() {
  const { t } = useI18n();
  // Server render and first client render: hidden (avoids a flash and mismatch).
  const closed = useSyncExternalStore(subscribe, dismissed, () => true);

  if (closed) return null;

  function close() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // storage blocked: it will simply show again next time
    }
    listeners.forEach((l) => l());
  }

  return (
    <section
      aria-label={t("cookies.noticeTitle")}
      className="animate-fade-in fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-card-border bg-card p-3 pl-4 shadow-lg">
        <p className="min-w-0 flex-1 text-xs leading-relaxed text-muted">
          {t("cookies.notice")}{" "}
          <Link
            href="/informasjonskapsler"
            className="font-medium text-accent underline-offset-2 hover:text-accent-hover hover:underline"
          >
            {t("cookies.readMore")}
          </Link>
        </p>
        <button
          type="button"
          onClick={close}
          className="h-9 shrink-0 rounded-xl bg-accent px-4 text-sm font-medium text-white transition hover:bg-accent-hover active:scale-95"
        >
          {t("cookies.ok")}
        </button>
      </div>
    </section>
  );
}
