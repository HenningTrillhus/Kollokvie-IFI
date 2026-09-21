import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/get-user";
import { getProfileById } from "@/lib/profiles";
import ConsentActions from "@/components/consent-actions";
import LanguageSwitch from "@/components/language-switch";
import LegalLinks from "@/components/legal-links";
import Logo from "@/components/logo";
import { getPolicy } from "@/lib/privacy-content";
import { PRIVACY_VERSION } from "@/lib/privacy";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "Samtykke · Kollokvie@IFI" };

// Shown to signed-in users who haven't accepted the current privacy policy
// (everyone who signed up before it existed, and after any big change).
export default async function ConsentPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const profile = await getProfileById(supabase, user.id);
  if (!profile || profile.privacy_version === PRIVACY_VERSION) redirect("/dashboard");

  const { t, lang } = await getT();
  const policy = getPolicy(lang);

  return (
    <main id="main-content" className="relative mx-auto w-full max-w-md px-6 pb-12 pt-16">
      <LanguageSwitch />

      <div className="mb-6 text-center">
        <Logo className="mb-4 inline-block h-14 w-14" />
        <h1 className="text-xl font-semibold tracking-tight">{t("consent.title")}</h1>
        <p className="mt-2 text-sm text-muted">{t("consent.intro")}</p>
      </div>

      <ul className="mb-4 space-y-3 rounded-2xl border border-card-border bg-card p-4">
        {policy.summary.map((line) => (
          <li key={line} className="flex gap-3 text-sm leading-relaxed">
            <span
              aria-hidden
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
            />
            {line}
          </li>
        ))}
      </ul>

      <p className="mb-2 text-center text-sm">
        <Link
          href="/personvern"
          className="font-medium text-accent hover:text-accent-hover"
        >
          {t("consent.readMore")}
        </Link>
      </p>
      <p className="mb-3 text-center text-xs text-muted">{t("consent.terms")}</p>
      <LegalLinks className="mb-5 justify-center" />

      <ConsentActions userId={user.id} />
    </main>
  );
}
