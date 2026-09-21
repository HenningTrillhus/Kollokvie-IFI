import type { ReactNode } from "react";
import BackButton from "@/components/back-button";
import LanguageSwitch from "@/components/language-switch";
import LegalLinks from "@/components/legal-links";
import CookieNotice from "@/components/cookie-notice";

// The frame around a public legal page (privacy, terms, cookies,
// accessibility). "Back" (left) and the language switch (right) sit in a bar
// that stays at the top of the screen while you read. It starts below the
// iPhone status bar / notch (safe area) so both can be tapped.
export default function LegalPage({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 border-b border-card-border/60 bg-background/90 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-6 pb-2.5">
          <BackButton />
          <LanguageSwitch inline />
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto w-full max-w-2xl px-6 pb-16 pt-[calc(env(safe-area-inset-top,0px)+5.25rem)]"
      >
        {children}
        <LegalLinks className="mt-8 justify-center" />
        <CookieNotice />
      </main>
    </>
  );
}
