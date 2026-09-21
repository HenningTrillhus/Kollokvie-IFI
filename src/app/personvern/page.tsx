import PrivacyDocument from "@/components/privacy-document";
import BackButton from "@/components/back-button";
import LanguageSwitch from "@/components/language-switch";

export const metadata = { title: "Personvern · Kollokvie@IFI" };

// Public: linked from the sign-up form and the consent screen.
export default function PrivacyPage() {
  return (
    <main className="relative mx-auto w-full max-w-2xl px-6 pb-16 pt-14">
      <LanguageSwitch />
      <div className="mb-6">
        <BackButton />
      </div>
      <PrivacyDocument />
    </main>
  );
}
