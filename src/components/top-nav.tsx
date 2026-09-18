"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { avatarStyle, type Profile } from "@/lib/profiles";
import { HomeIcon, GroupsIcon, CalendarIcon, SearchIcon } from "./nav-icons";

const LINKS = [
  { href: "/dashboard", label: "Hjem", Icon: HomeIcon },
  { href: "/groups", label: "Mine kollokviegrupper", Icon: GroupsIcon },
  { href: "/calendar", label: "Kalender", Icon: CalendarIcon },
  { href: "/search", label: "Søk", Icon: SearchIcon },
];

export default function TopNav({
  profile,
  pendingRequestCount,
}: {
  profile: Profile | null;
  pendingRequestCount: number;
}) {
  const pathname = usePathname();
  const initial = (profile?.full_name || profile?.username || "?")
    .charAt(0)
    .toUpperCase();

  return (
    <header className="flex items-center gap-2 border-b border-card-border px-3 py-2.5 sm:gap-6 sm:px-6 sm:py-4">
      <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-white">
          K
        </div>
        <span className="hidden font-semibold tracking-tight sm:inline">
          Kollokvie<span className="text-accent">@IFI</span>
        </span>
      </Link>

      <nav className="flex min-w-0 flex-1 items-center justify-around gap-1 sm:justify-start">
        {LINKS.map(({ href, label, Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium transition sm:px-3 ${
                isActive
                  ? "bg-accent-soft text-accent"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="hidden whitespace-nowrap sm:inline">{label}</span>
            </Link>
          );
        })}
      </nav>

      <Link
        href="/profile"
        style={avatarStyle(profile?.accent_color)}
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition hover:opacity-80"
        aria-label="Din profil"
      >
        {initial}
        {pendingRequestCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 ring-2 ring-background" />
        )}
      </Link>
    </header>
  );
}
