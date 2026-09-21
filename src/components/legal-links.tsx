"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/client";

// Privacy / terms / cookies, as a row of small links.
export default function LegalLinks({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  const link = "transition hover:text-foreground hover:underline underline-offset-2";

  return (
    <nav
      aria-label={t("legal.nav")}
      className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-muted sm:gap-x-3 sm:text-xs ${className}`}
    >
      <Link href="/personvern" className={link}>
        {t("privacy.link")}
      </Link>
      <Link href="/vilkar" className={link}>
        {t("terms.link")}
      </Link>
      <Link href="/informasjonskapsler" className={link}>
        {t("cookies.short")}
      </Link>
      <Link href="/tilgjengelighet" className={link}>
        {t("a11y.link")}
      </Link>
    </nav>
  );
}
