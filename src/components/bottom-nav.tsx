"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Hovedmeny"
      className="flex shrink-0 border-t border-card-border bg-background pb-[env(safe-area-inset-bottom)] sm:hidden"
    >
      {NAV_ITEMS.map(({ href, shortLabel, label, Icon }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-1 flex-col items-center gap-0.5 pb-1.5 pt-2 text-[10px] font-medium transition active:scale-90 ${
              isActive ? "text-accent" : "text-muted"
            }`}
          >
            <span
              className={`flex h-7 w-12 items-center justify-center rounded-full transition ${
                isActive ? "bg-accent-soft" : ""
              }`}
            >
              <Icon className="h-5 w-5" />
            </span>
            {shortLabel}
          </Link>
        );
      })}
    </nav>
  );
}
