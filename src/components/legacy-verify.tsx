"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import VerifyCodeForm from "@/components/verify-code-form";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";

// For accounts made before email codes existed: verify the IFI address once.
export default function LegacyVerify({ email }: { email: string }) {
  const router = useRouter();
  const { t } = useI18n();
  const [step, setStep] = useState<"intro" | "code">("intro");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function sendCode() {
    setBusy(true);
    setError("");
    const supabase = createClient();
    // Changing the account's email sends the code to the NEW address.
    const { error: updateError } = await supabase.auth.updateUser({ email });
    setBusy(false);
    if (updateError) {
      const message = updateError.message.toLowerCase();
      setError(
        message.includes("already") || message.includes("registered")
          ? t("verify.emailTaken")
          : message.includes("rate limit")
            ? t("verify.tooMany")
            : t("verify.sendFailed")
      );
      return false;
    }
    setStep("code");
    return true;
  }

  async function resend() {
    const supabase = createClient();
    const { error: resendError } = await supabase.auth.resend({ type: "email_change", email });
    return !resendError;
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {step === "intro" ? (
        <>
          <p className="text-center text-sm text-muted">{t("verify.legacyText", { email })}</p>
          {error && <p className="text-center text-sm text-red-500">{error}</p>}
          <button
            onClick={sendCode}
            disabled={busy}
            className="h-11 w-full rounded-xl bg-accent text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
          >
            {busy ? t("verify.sending") : t("verify.sendCode")}
          </button>
        </>
      ) : (
        <VerifyCodeForm
          email={email}
          type="email_change"
          onVerified={() => {
            router.push("/dashboard");
            router.refresh();
          }}
          onResend={resend}
          onBack={() => setStep("intro")}
        />
      )}

      <button
        onClick={signOut}
        className="block w-full text-center text-xs text-muted transition hover:text-foreground"
      >
        {t("auth.signOut")}
      </button>
    </div>
  );
}
