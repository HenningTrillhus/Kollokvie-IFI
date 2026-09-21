import LegalDocument from "@/components/legal-document";
import LegalPage from "@/components/legal-page";
import { getCookiePolicy } from "@/lib/legal-content";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "Informasjonskapsler · Kollokvie@IFI" };

export default async function CookiesPage() {
  const { lang } = await getT();
  return (
    <LegalPage>
      <LegalDocument policy={getCookiePolicy(lang)} />
    </LegalPage>
  );
}
