"use client";

import Link from "next/link";
import AuthShell from "@/components/auth-shell";
import { PRIVACY_VERSION } from "@/lib/privacy";
import { SIGNED_IN_TOAST_KEY } from "@/components/signed-in-toast";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { EMAIL_VERIFICATION_ENABLED, emailForIfiUsername, ifiEmail } from "@/lib/ifi-auth";
import VerifyCodeForm from "@/components/verify-code-form";
import { IFI_USERNAME_PATTERN } from "@/lib/profiles";
import { MIN_PASSWORD_LENGTH } from "@/lib/passwords";
import { useI18n } from "@/lib/i18n/client";


export default function SignupPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [fullName, setFullName] = useState("");
  const [ifiUsername, setIfiUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  // After the form: enter the code we emailed to the IFI address.
  const [step, setStep] = useState<"form" | "code">("form");
  const [pendingEmail, setPendingEmail] = useState("");

  function finish() {
    try {
      sessionStorage.removeItem(SIGNED_IN_TOAST_KEY);
    } catch {
      // ignore
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function resendCode() {
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email: pendingEmail });
    return !error;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage("");

    if (!consent) {
      setErrorMessage(t("auth.consentRequired"));
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

    const email = emailForIfiUsername(ifiUsername);

    // A half-finished earlier sign-up (never confirmed) must not block this one:
    // clear it first. Confirmed accounts are never touched. (Ignored if the
    // database function isn't installed.)
    await supabase.rpc("release_unconfirmed_signup", {
      p_email: email,
      p_username: ifiUsername.trim().toLowerCase(),
    });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          // The IFI username is the username too.
          username: ifiUsername.trim().toLowerCase(),
          ifi_username: ifiUsername.trim().toLowerCase(),
          // Recorded with a timestamp by the database when the account is made.
          privacy_version: PRIVACY_VERSION,
        },
      },
    });

    if (error) {
      setLoading(false);
      const message = error.message.toLowerCase();
      setErrorMessage(
        message.includes("already registered")
          ? t("auth.alreadyRegistered")
          : message.includes("rate limit")
            ? t("verify.tooMany")
            : message.includes("database error")
              ? t("auth.signupFailed")
              : error.message
      );
      return;
    }

    // Supabase hides whether an address exists: an "empty" identity list means
    // this IFI username already has an account.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setLoading(false);
      setErrorMessage(t("auth.alreadyRegistered"));
      return;
    }

    // Signed in straight away (email confirmation is off): nothing to verify.
    if (data.session) {
      finish();
      return;
    }

    setPendingEmail(email);
    setStep("code");
    setLoading(false);
  }

  return (
    <AuthShell title={step === "code" ? t("verify.title") : t("auth.signup")}>
          {step === "code" ? (
            <VerifyCodeForm
              email={pendingEmail}
              type="signup"
              onVerified={finish}
              onResend={resendCode}
              onBack={() => setStep("form")}
            />
          ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="fullName"
                className="mb-1 block text-sm font-medium"
              >
                {t("auth.fullName")}
              </label>
              <input
                id="fullName"
                type="text"
                required
                autoFocus
                maxLength={100}
                autoComplete="name"
                placeholder="Ola Nordmann"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-card-border bg-transparent px-4 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
              />
            </div>

            <div>
              <label
                htmlFor="ifiUsername"
                className="mb-1 block text-sm font-medium"
              >
                {t("auth.ifiUsername")}
              </label>
              <input
                id="ifiUsername"
                type="text"
                required
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="olan"
                value={ifiUsername}
                // It's part of an email address: lowercase only, no spaces.
                onChange={(e) => setIfiUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
                className="w-full rounded-xl border border-card-border bg-transparent px-4 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
              />
              <p className="mt-1 text-xs text-muted">
                {EMAIL_VERIFICATION_ENABLED
                  ? t("auth.ifiEmailHint", { email: ifiEmail(ifiUsername || "brukernavn") })
                  : t("auth.ifiHint")}
              </p>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium"
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
                className="w-full rounded-xl border border-card-border bg-transparent px-4 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-sm font-medium"
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
                className="w-full rounded-xl border border-card-border bg-transparent px-4 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
              />
            </div>

            <label className="flex cursor-pointer items-start gap-3 text-sm leading-snug">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
              />
              <span className="text-muted">
                {t("auth.consentBefore")}
                <Link
                  href="/personvern"
                  target="_blank"
                  className="font-medium text-accent hover:text-accent-hover"
                >
                  {t("auth.privacyLink")}
                </Link>
                {t("auth.consentAnd")}
                <Link
                  href="/vilkar"
                  target="_blank"
                  className="font-medium text-accent hover:text-accent-hover"
                >
                  {t("auth.termsLink")}
                </Link>
                {t("auth.consentAfter")}
              </span>
            </label>

            {errorMessage && (
              <p role="alert" className="text-sm text-red-500">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover active:scale-[0.99] disabled:opacity-60"
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
          )}
    </AuthShell>
  );
}
