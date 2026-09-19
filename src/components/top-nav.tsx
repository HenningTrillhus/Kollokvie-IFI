"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { avatarStyle, type Profile } from "@/lib/profiles";
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
  const initial = (profile?.full_name || profile?.username || "?")
    .charAt(0)
    .toUpperCase();

  return (
    <header className="flex shrink-0 items-center gap-6 border-b border-card-border bg-background px-4 pb-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] sm:px-6 sm:py-4">
      <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-white">
          K
        </div>
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
        style={avatarStyle(profile?.accent_color)}
        className="relative ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition active:scale-95 sm:ml-0"
        aria-label={t("nav.yourProfile")}
      >
        {initial}
        {pendingRequestCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 ring-2 ring-background" />
        )}
      </Link>
    </header>
  );
}
