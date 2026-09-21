"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Profile } from "@/lib/profiles";
import Avatar from "@/components/avatar";
import Logo from "@/components/logo";
import { NAV_ITEMS } from "./nav-items";
import { useI18n } from "@/lib/i18n/client";

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

      <Link
        href="/profile"
        className="relative ml-auto flex h-9 w-9 shrink-0 rounded-full transition active:scale-95 sm:ml-0"
        aria-label={t("nav.yourProfile")}
      >
        <Avatar profile={profile} className="h-9 w-9 text-sm" />
        {pendingRequestCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 ring-2 ring-background" />
        )}
      </Link>
      </div>
    </header>
  );
}
