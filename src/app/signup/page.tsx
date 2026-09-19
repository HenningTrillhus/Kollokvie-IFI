"use client";

import Link from "next/link";
import LanguageSwitch from "@/components/language-switch";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { emailForIfiUsername } from "@/lib/ifi-auth";
import { IFI_USERNAME_PATTERN, USERNAME_PATTERN } from "@/lib/profiles";
import { useI18n } from "@/lib/i18n/client";

const MIN_PASSWORD_LENGTH = 6;

export default function SignupPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [ifiUsername, setIfiUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage("");

    if (!USERNAME_PATTERN.test(username.trim())) {
      setErrorMessage(t("auth.usernameInvalid"));
      return;
    }
    if (!IFI_USERNAME_PATTERN.test(ifiUsername.trim())) {
      setErrorMessage(t("auth.ifiInvalid"));
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(t("auth.passwordShort", { min: MIN_PASSWORD_LENGTH }));
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage(t("auth.passwordMismatch"));
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: emailForIfiUsername(ifiUsername),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          username: username.trim(),
          ifi_username: ifiUsername.trim(),
        },
      },
    });

    if (error) {
      setLoading(false);
      setErrorMessage(
        error.message.includes("already registered")
          ? t("auth.alreadyRegistered")
          : error.message
      );
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden px-6 py-16">
      <LanguageSwitch />

      <div className="relative w-full max-w-sm">
        <div className="mb-10 text-center">
          <Link
            href="/"
            className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-lg font-semibold text-white"
          >
            K
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("auth.signup")}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Kollokvie<span className="text-accent">@IFI</span>
          </p>
        </div>

        <div className="rounded-2xl border border-card-border bg-card p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="mb-1.5 block text-sm font-medium"
              >
                {t("auth.fullName")}
              </label>
              <input
                id="fullName"
                type="text"
                required
                autoFocus
                autoComplete="name"
                placeholder="Ola Nordmann"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-card-border bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
              />
            </div>

            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-sm font-medium"
              >
                {t("auth.username")}
              </label>
              <input
                id="username"
                type="text"
                required
                autoComplete="username"
                placeholder="olanordmann"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-card-border bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
              />
            </div>

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
                placeholder="olan"
                value={ifiUsername}
                onChange={(e) => setIfiUsername(e.target.value)}
                className="w-full rounded-xl border border-card-border bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
              />
              <p className="mt-1 text-xs text-muted">
                {t("auth.ifiHint")}
              </p>
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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-card-border bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-sm font-medium"
              >
                {t("auth.confirmPassword")}
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? t("auth.creating") : t("auth.createUser")}
            </button>

            <p className="pt-1 text-center text-xs text-muted">
              {t("auth.haveAccount")}{" "}
              <Link
                href="/login"
                className="font-medium text-accent hover:text-accent-hover"
              >
                {t("auth.login")}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
