"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Logo from "@/components/logo";
import LanguageSwitch from "@/components/language-switch";
import { cardClass } from "@/components/form-ui";
import { useI18n } from "@/lib/i18n/client";

// The frame around login and sign-up: fits the screen without scrolling, the
// form is centred, and the small links (privacy, language) sit at the bottom
// where a thumb can reach them.
export default function AuthShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const { t } = useI18n();

  return (
    <main className="auth-shell flex h-dvh flex-col overflow-hidden px-4 pt-[env(safe-area-inset-top)]">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center py-3">
        <div className="animate-fade-in w-full max-w-sm">
          <div className="mb-3 flex items-center justify-center gap-3">
            <Link href="/" className="shrink-0">
              <Logo className="h-11 w-11" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold leading-tight tracking-tight">{title}</h1>
              <p className="text-sm leading-tight text-muted">
                Kollokvie<span className="text-accent">@IFI</span>
              </p>
            </div>
          </div>

          <div className={`p-4 ${cardClass}`}>{children}</div>
        </div>
      </div>

      <footer className="mx-auto flex w-full max-w-sm shrink-0 items-center justify-between pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1">
        <Link href="/personvern" className="text-xs text-muted transition hover:text-foreground">
          {t("privacy.link")}
        </Link>
        <LanguageSwitch inline />
      </footer>
    </main>
  );
}
