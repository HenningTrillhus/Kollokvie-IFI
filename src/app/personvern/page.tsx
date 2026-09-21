import PrivacyDocument from "@/components/privacy-document";
import LegalPage from "@/components/legal-page";

export const metadata = { title: "Personvern · Kollokvie@IFI" };

// Public: linked from the sign-up form and the consent screen.
export default function PrivacyPage() {
  return (
    <LegalPage>
      <PrivacyDocument />
    </LegalPage>
  );
}
