"use client";

import { useEffect, useState } from "react";
import Avatar from "@/components/avatar";
import { useI18n } from "@/lib/i18n/client";
import type { Profile } from "@/lib/profiles";

export const SIGNED_IN_TOAST_KEY = "kollokvie:signed-in-toast";

// A small "Signed in as …" note that slides in once each time the app is
// opened (or you sign in), so it's clear the saved login worked.
export default function SignedInToast({ profile }: { profile: Profile | null }) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SIGNED_IN_TOAST_KEY) === "1";
    } catch {
      // storage blocked: just show it
    }
    if (seen) return;

    const show = setTimeout(() => {
      try {
        sessionStorage.setItem(SIGNED_IN_TOAST_KEY, "1");
      } catch {
        // ignore
      }
      setVisible(true);
    }, 500);
    const hide = setTimeout(() => setVisible(false), 4500);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  if (!profile) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed left-1/2 top-[calc(env(safe-area-inset-top)+3.75rem)] z-50 -translate-x-1/2 transition-all duration-300 ease-out ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
      }`}
    >
      <div className="flex items-center gap-2.5 rounded-full border border-card-border bg-card py-1.5 pl-1.5 pr-4 shadow-lg">
        <Avatar profile={profile} className="h-7 w-7 text-xs" />
        <span className="whitespace-nowrap text-sm font-medium">
          {t("toast.signedInAs", { name: profile.full_name || profile.username || "" })}
        </span>
      </div>
    </div>
  );
}
