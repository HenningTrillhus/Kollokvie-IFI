import LegalDocument from "@/components/legal-document";
import LegalPage from "@/components/legal-page";
import { getTerms } from "@/lib/legal-content";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "Vilkår · Kollokvie@IFI" };

// Public: linked from the sign-up form and the consent screen.
export default async function TermsPage() {
  const { lang } = await getT();
  return (
    <LegalPage>
      <LegalDocument policy={getTerms(lang)} />
    </LegalPage>
  );
}
