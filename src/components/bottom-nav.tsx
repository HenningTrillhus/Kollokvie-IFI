"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";
import { useI18n } from "@/lib/i18n/client";

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav
      aria-label={t("nav.main")}
      className="flex shrink-0 border-t border-card-border bg-background pb-[calc(env(safe-area-inset-bottom)*0.4)] sm:hidden"
    >
      {NAV_ITEMS.map(({ href, shortKey, labelKey, Icon }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-label={t(labelKey)}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-1 flex-col items-center pb-1 pt-1.5 text-[10px] leading-tight font-medium transition active:scale-90 ${
              isActive ? "text-accent" : "text-muted"
            }`}
          >
            <span
              className={`mb-px flex h-6 w-11 items-center justify-center rounded-full transition ${
                isActive ? "bg-accent-soft" : ""
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
            </span>
            {t(shortKey)}
          </Link>
        );
      })}
    </nav>
  );
}
