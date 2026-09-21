"use client";

import { useEffect, useRef, useState } from "react";
import { RATE_LIMIT_EVENT } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";

// A small, calm notice when the server turns a request away for coming too
// fast. Vanishes by itself.
export default function RateLimitNotice() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    function show() {
      setVisible(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setVisible(false), 6000);
    }
    window.addEventListener(RATE_LIMIT_EVENT, show);
    return () => {
      window.removeEventListener(RATE_LIMIT_EVENT, show);
      clearTimeout(timer.current);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5rem)] z-50 flex justify-center px-4 transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      {visible && (
        <p className="max-w-sm rounded-2xl border border-card-border bg-card px-4 py-2.5 text-center text-sm shadow-lg">
          {t("rate.limited")}
        </p>
      )}
    </div>
  );
}
