"use client";

import Link from "next/link";
import LanguageSwitch from "@/components/language-switch";
import { SIGNED_IN_TOAST_KEY } from "@/components/signed-in-toast";
import Logo from "@/components/logo";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { emailForIfiUsername } from "@/lib/ifi-auth";
import { useI18n } from "@/lib/i18n/client";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [ifiUsername, setIfiUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: emailForIfiUsername(ifiUsername),
      password,
    });

    if (error) {
      setLoading(false);
      setErrorMessage(t("auth.badCredentials"));
      return;
    }

    try {
      sessionStorage.removeItem(SIGNED_IN_TOAST_KEY);
    } catch {
      // ignore
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden px-6 py-16">
      <LanguageSwitch />

      <div className="relative w-full max-w-sm">
        <div className="mb-10 text-center">
          <Link href="/" className="mb-4 inline-block">
            <Logo className="h-16 w-16" />
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("auth.login")}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Kollokvie<span className="text-accent">@IFI</span>
          </p>
        </div>

        <div className="rounded-2xl border border-card-border bg-card p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="ifiUsername"
                className="mb-1.5 block text-sm font-medium"
              >
                {t("auth.ifiUsername")}
              </label>
              <input
                id="ifiUsername"
                type="text"
                required
                autoFocus
                placeholder="olan"
                value={ifiUsername}
                onChange={(e) => setIfiUsername(e.target.value)}
                className="w-full rounded-xl border border-card-border bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium"
              >
                {t("auth.password")}
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-card-border bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
              />
            </div>

            {errorMessage && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
            >
              {loading ? t("auth.loggingIn") : t("auth.login")}
            </button>

            <p className="pt-1 text-center text-xs text-muted">
              {t("auth.newHere")}{" "}
              <Link
                href="/signup"
                className="font-medium text-accent hover:text-accent-hover"
              >
                {t("auth.signup")}
              </Link>
            </p>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          <Link href="/personvern" className="transition hover:text-foreground">
            {t("privacy.link")}
          </Link>
        </p>
      </div>
    </main>
  );
}
