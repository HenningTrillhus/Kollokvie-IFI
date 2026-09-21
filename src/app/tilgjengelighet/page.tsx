import LegalDocument from "@/components/legal-document";
import LegalPage from "@/components/legal-page";
import { getAccessibility } from "@/lib/accessibility-content";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "Tilgjengelighet · Kollokvie@IFI" };

export default async function AccessibilityPage() {
  const { lang } = await getT();
  return (
    <LegalPage>
      <LegalDocument policy={getAccessibility(lang)} topic="a11y" />
    </LegalPage>
  );
}
