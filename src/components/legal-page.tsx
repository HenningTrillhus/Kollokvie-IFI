import type { ReactNode } from "react";
import BackButton from "@/components/back-button";
import LanguageSwitch from "@/components/language-switch";
import LegalLinks from "@/components/legal-links";
import CookieNotice from "@/components/cookie-notice";

// The frame around a public legal page (privacy, terms, cookies,
// accessibility). "Back" sits on the left and the language switch on the
// right, on the same row.
export default function LegalPage({ children }: { children: ReactNode }) {
  return (
    <main id="main-content" className="mx-auto w-full max-w-2xl px-6 pb-16 pt-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <BackButton />
        <LanguageSwitch inline />
      </div>
      {children}
      <LegalLinks className="mt-8 justify-center" />
      <CookieNotice />
    </main>
  );
}
