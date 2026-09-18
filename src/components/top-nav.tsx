"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Profile } from "@/lib/profiles";

const LINKS = [
  { href: "/dashboard", label: "Hjem" },
  { href: "/groups", label: "Mine grupper" },
  { href: "/calendar", label: "Kalender" },
  { href: "/search", label: "Søk" },
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
    <header className="flex items-center justify-between border-b border-card-border px-6 py-4">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-white">
            K
          </div>
          <span className="hidden font-semibold tracking-tight sm:inline">
            Kollokvie<span className="text-accent">@IFI</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {LINKS.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-accent-soft text-accent"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <Link
        href="/profile"
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent transition hover:opacity-80"
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
