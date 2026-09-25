"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Profile } from "@/lib/profiles";
import Avatar from "@/components/avatar";
import Logo from "@/components/logo";
import { BellIcon } from "@/components/meta-icons";
import { NAV_ITEMS } from "./nav-items";
import { useI18n } from "@/lib/i18n/client";

// The bell: always visible, badge for pending follow requests and group
// invites, and a little ring whenever that count goes up (checked on every
// AutoRefresh tick, focus or reconnect — see components/auto-refresh.tsx).
function NotificationBell({ count }: { count: number }) {
  const { t } = useI18n();
  const [justArrived, setJustArrived] = useState(false);
  const previous = useRef(count);

  useEffect(() => {
    if (count > previous.current) {
      setJustArrived(true);
      const id = setTimeout(() => setJustArrived(false), 500);
      previous.current = count;
      return () => clearTimeout(id);
    }
    previous.current = count;
  }, [count]);

  return (
    <Link
      href="/inbox"
      aria-label={t("inbox.title")}
      className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-accent-soft hover:text-foreground active:scale-90"
    >
      <BellIcon className={`h-5 w-5 ${justArrived ? "animate-bell-ring" : ""}`} />
      {count > 0 && (
        <span
          className={`absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-background ${
            justArrived ? "animate-check-pop" : ""
          }`}
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}

export default function TopNav({
  profile,
  pendingRequestCount,
}: {
  profile: Profile | null;
  pendingRequestCount: number;
}) {
  const pathname = usePathname();
  const { t } = useI18n();
  return (
    <header className="shrink-0 border-b border-card-border bg-background pb-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] sm:py-3.5">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
      <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5">
        <Logo className="h-8 w-8" />
        <span className="font-semibold tracking-tight">
          Kollokvie<span className="text-accent">@IFI</span>
        </span>
      </Link>

      <nav className="hidden min-w-0 flex-1 items-center gap-1 sm:flex">
        {NAV_ITEMS.map(({ href, labelKey, Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                isActive
                  ? "bg-accent-soft text-accent"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="whitespace-nowrap">{t(labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:ml-0">
        <NotificationBell count={pendingRequestCount} />
        <Link
          href="/profile"
          className="flex h-9 w-9 shrink-0 rounded-full transition active:scale-95"
          aria-label={t("nav.yourProfile")}
        >
          <Avatar profile={profile} className="h-9 w-9 text-sm" />
        </Link>
      </div>
      </div>
    </header>
  );
}
