"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "./sign-out-button";

const LINKS = [
  { href: "/dashboard", label: "Hjem" },
  { href: "/groups", label: "Mine grupper" },
  { href: "/calendar", label: "Kalender" },
];

export default function TopNav() {
  const pathname = usePathname();

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

      <SignOutButton />
    </header>
  );
}
