"use client";

import Link from "next/link";
import AuthShell from "@/components/auth-shell";
import { SIGNED_IN_TOAST_KEY } from "@/components/signed-in-toast";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { EMAIL_VERIFICATION_ENABLED, loginEmails } from "@/lib/ifi-auth";
import VerifyCodeForm from "@/components/verify-code-form";
import { useI18n } from "@/lib/i18n/client";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [ifiUsername, setIfiUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  // If the address was never confirmed, we send a code and ask for it here.
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);

  function finish() {
    try {
      sessionStorage.removeItem(SIGNED_IN_TOAST_KEY);
    } catch {
      // ignore
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const supabase = createClient();
    let unconfirmed: string | null = null;
    let signedIn = false;

    // The IFI address first, then the made-up one older accounts still use.
    for (const email of loginEmails(ifiUsername)) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) {
        signedIn = true;
        break;
      }
      if (error.message.toLowerCase().includes("not confirmed")) {
        unconfirmed = email;
        break;
      }
    }

    if (signedIn) {
      finish();
      return;
    }

    if (unconfirmed) {
      const { error: sendError } = await supabase.auth.resend({
        type: "signup",
        email: unconfirmed,
      });
      setLoading(false);
      // Don't ask for a code that was never sent.
      if (sendError) {
        setErrorMessage(
          sendError.message.toLowerCase().includes("rate limit")
            ? t("verify.tooMany")
            : t("verify.sendFailed")
        );
        return;
      }
      setConfirmEmail(unconfirmed);
      return;
    }

    setLoading(false);
    setErrorMessage(t("auth.badCredentials"));
  }

  async function resendCode() {
    if (!confirmEmail) return false;
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email: confirmEmail });
    return !error;
  }

  return (
    <AuthShell title={confirmEmail ? t("verify.title") : t("auth.login")}>
          {confirmEmail ? (
            <VerifyCodeForm
              email={confirmEmail}
              type="signup"
              onVerified={finish}
              onResend={resendCode}
              onBack={() => setConfirmEmail(null)}
            />
          ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
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
                autoFocus
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="olan"
                value={ifiUsername}
                onChange={(e) => setIfiUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
                className="w-full rounded-xl border border-card-border bg-transparent px-4 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
              />
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-card-border bg-transparent px-4 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
              />
              {EMAIL_VERIFICATION_ENABLED && (
                <p className="mt-1.5 text-right text-xs">
                  <Link
                    href="/glemt-passord"
                    className="font-medium text-accent hover:text-accent-hover"
                  >
                    {t("auth.forgot")}
                  </Link>
                </p>
              )}
            </div>

            {errorMessage && (
              <p role="alert" className="text-sm text-red-500">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover active:scale-[0.99] disabled:opacity-60"
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
          )}
    </AuthShell>
  );
}
