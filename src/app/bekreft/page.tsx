import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/get-user";
import { getProfileById } from "@/lib/profiles";
import { ifiEmail, isLegacyEmail } from "@/lib/ifi-auth";
import LanguageSwitch from "@/components/language-switch";
import LegacyVerify from "@/components/legacy-verify";
import Logo from "@/components/logo";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "Bekreft e-post · Kollokvie@IFI" };

// Shown once to accounts made before email codes existed.
export default async function VerifyEmailPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");
  if (!isLegacyEmail(user.email)) redirect("/dashboard");

  const supabase = await createClient();
  const profile = await getProfileById(supabase, user.id);
  if (!profile) redirect("/dashboard");

  const { t } = await getT();

  return (
    <main id="main-content" className="relative mx-auto w-full max-w-sm px-6 pb-12 pt-20">
      <LanguageSwitch />
      <div className="mb-6 text-center">
        <Logo className="mb-4 inline-block h-14 w-14" />
        <h1 className="text-xl font-semibold tracking-tight">{t("verify.legacyTitle")}</h1>
      </div>
      <div className="rounded-2xl border border-card-border bg-card p-6 shadow-sm">
        <LegacyVerify email={ifiEmail(profile.ifi_username)} />
      </div>
    </main>
  );
}
