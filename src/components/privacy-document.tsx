import LegalDocument from "@/components/legal-document";
import { getPolicy } from "@/lib/privacy-content";
import { getT } from "@/lib/i18n/server";

// The full privacy policy, in the user's language.
export default async function PrivacyDocument() {
  const { lang } = await getT();
  return <LegalDocument policy={getPolicy(lang)} />;
}
