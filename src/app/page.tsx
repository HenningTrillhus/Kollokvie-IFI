import Link from "next/link";
import LanguageSwitch from "@/components/language-switch";
import Logo from "@/components/logo";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/get-user";
import { getT } from "@/lib/i18n/server";

export default async function Home() {
  const user = await getAuthUser();

  if (user) {
    redirect("/dashboard");
  }

  const { t } = await getT();

  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden px-6 py-16">
      <LanguageSwitch />

      <div className="relative w-full max-w-sm text-center">
        <div className="mb-10">
          <Logo className="mb-4 inline-block h-16 w-16" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Kollokvie<span className="text-accent">@IFI</span>
          </h1>
          <p className="mt-2 text-sm text-muted">
            {t("app.tagline")}
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
          >
            {t("auth.login")}
          </Link>
          <Link
            href="/signup"
            className="block w-full rounded-xl border border-card-border px-4 py-2.5 text-sm font-medium transition hover:bg-accent-soft"
          >
            {t("auth.signup")}
          </Link>
        </div>

        <p className="mt-8 text-xs text-muted">
          {t("app.forStudents")}
          {" · "}
          <Link href="/personvern" className="underline-offset-2 transition hover:text-foreground hover:underline">
            {t("privacy.link")}
          </Link>
        </p>
      </div>
    </main>
  );
}
