"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import LegalLinks from "@/components/legal-links";
import CookieNotice from "@/components/cookie-notice";
import Logo from "@/components/logo";
import LanguageSwitch from "@/components/language-switch";
import { cardClass } from "@/components/form-ui";

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

  return (
    <main id="main-content" className="auth-shell flex flex-col bg-[radial-gradient(48rem_28rem_at_50%_-8%,var(--accent-soft),transparent)] px-4 pt-[env(safe-area-inset-top)]">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center py-3">
        <div className="animate-fade-in w-full max-w-sm md:max-w-md">
          <div className="mb-3 flex items-center justify-center gap-3 md:mb-5">
            <Link href="/" aria-label="Kollokvie@IFI" className="shrink-0">
              <Logo className="h-11 w-11 md:h-14 md:w-14" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold leading-tight tracking-tight md:text-2xl">{title}</h1>
              <p className="text-sm leading-tight text-muted">
                Kollokvie<span className="text-accent">@IFI</span>
              </p>
            </div>
          </div>

          <div className={`p-4 shadow-sm md:p-6 ${cardClass}`}>{children}</div>
        </div>
      </div>

      <footer className="mx-auto flex w-full max-w-sm shrink-0 md:max-w-md items-center justify-between pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1">
        <LegalLinks />
        <LanguageSwitch inline />
      </footer>
      <CookieNotice />
    </main>
  );
}
