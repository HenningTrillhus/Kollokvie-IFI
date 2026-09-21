"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import AuthShell from "@/components/auth-shell";
import VerifyCodeForm from "@/components/verify-code-form";
import { SIGNED_IN_TOAST_KEY } from "@/components/signed-in-toast";
import { createClient } from "@/lib/supabase/client";
import { EMAIL_VERIFICATION_ENABLED, ifiEmail } from "@/lib/ifi-auth";
import { MIN_PASSWORD_LENGTH, checkPassword } from "@/lib/passwords";
import { StrengthBar, StrengthLabel } from "@/components/password-strength";
import { IFI_USERNAME_PATTERN } from "@/lib/profiles";
import { useI18n } from "@/lib/i18n/client";

type Step = "email" | "code" | "password";

const inputClass =
  "w-full rounded-xl border border-card-border bg-transparent px-4 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft";

// Forgot password: IFI username -> code emailed to <username>@uio.no ->
// choose a new password. The screen never says whether the account exists.
export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [step, setStep] = useState<Step>("email");
  const [ifiUsername, setIfiUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const email = ifiEmail(ifiUsername);
  const strength = checkPassword(password, { username: ifiUsername });

  async function sendCode(): Promise<"ok" | "limited" | "failed"> {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (!error) return "ok";
    // An unknown address doesn't error, so this never reveals who has an account.
    return error.status === 429 || error.message.toLowerCase().includes("rate limit")
      ? "limited"
      : "failed";
  }

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    setErrorMessage("");
    if (!IFI_USERNAME_PATTERN.test(ifiUsername.trim())) {
      setErrorMessage(t("auth.ifiInvalid"));
      return;
    }
    setLoading(true);
    const result = await sendCode();
    setLoading(false);
    if (result === "limited") return setErrorMessage(t("verify.tooMany"));
    if (result === "failed") return setErrorMessage(t("reset.sendFailed"));
    setStep("code");
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setErrorMessage("");
    const strength = checkPassword(password, { username: ifiUsername });
    if (!strength.ok) {
      setErrorMessage(t(strength.problem ?? "pw.simple", { min: MIN_PASSWORD_LENGTH }));
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage(t("auth.passwordMismatch"));
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setLoading(false);
      setErrorMessage(t("reset.saveFailed"));
      return;
    }
    // A new password means every other device is signed out.
    await supabase.auth.signOut({ scope: "others" });

    try {
      sessionStorage.removeItem(SIGNED_IN_TOAST_KEY);
    } catch {
      // ignore
    }
    router.push("/dashboard");
    router.refresh();
  }

  // The feature relies on real email addresses, so it only exists once those are on.
  if (!EMAIL_VERIFICATION_ENABLED) {
    return (
      <AuthShell title={t("reset.title")}>
        <p className="text-center text-sm text-muted">{t("reset.unavailable")}</p>
        <p className="pt-3 text-center text-xs">
          <Link href="/login" className="font-medium text-accent hover:text-accent-hover">
            {t("reset.backToLogin")}
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={step === "password" ? t("reset.newTitle") : t("reset.title")}>
      {step === "email" && (
        <form onSubmit={handleSend} className="space-y-3">
          <p className="text-sm text-muted">{t("reset.intro")}</p>
          <div>
            <label htmlFor="ifiUsername" className="mb-1 block text-sm font-medium">
              {t("auth.ifiUsername")}
            </label>
            <input
              id="ifiUsername"
              type="text"
              required
              autoFocus
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="olan"
              value={ifiUsername}
              onChange={(e) => setIfiUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
              className={inputClass}
            />
          </div>

          {errorMessage && (
            <p role="alert" className="text-sm text-red-500">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? t("verify.sending") : t("verify.sendCode")}
          </button>

          <p className="pt-1 text-center text-xs">
            <Link href="/login" className="font-medium text-accent hover:text-accent-hover">
              {t("reset.backToLogin")}
            </Link>
          </p>
        </form>
      )}

      {step === "code" && (
        <VerifyCodeForm
          email={email}
          type="recovery"
          message={t("reset.sentNeutral", { email })}
          onVerified={() => setStep("password")}
          onResend={async () => (await sendCode()) === "ok"}
          onBack={() => setStep("email")}
        />
      )}

      {step === "password" && (
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <div className="mb-1 flex items-baseline justify-between">
              <label htmlFor="newPassword" className="text-sm font-medium">
                {t("reset.newPassword")}
              </label>
              <StrengthLabel check={strength} />
            </div>
            <div className="relative">
              <input
                id="newPassword"
                type="password"
                required
                autoFocus
                autoComplete="new-password"
                placeholder={t("pw.hint")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
              <StrengthBar check={strength} />
            </div>
          </div>
          <div>
            <label htmlFor="confirmNewPassword" className="mb-1 block text-sm font-medium">
              {t("auth.confirmPassword")}
            </label>
            <input
              id="confirmNewPassword"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          {errorMessage && (
            <p role="alert" className="text-sm text-red-500">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? t("reset.saving") : t("reset.save")}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
