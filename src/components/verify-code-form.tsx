"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";

// Supabase decides how long the emailed code is (Authentication > Providers >
// Email > "Email OTP Length"; 6 to 10 digits). We accept any of those, and
// confirm automatically once the expected length is typed. Set
// NEXT_PUBLIC_OTP_LENGTH to match it (default 8).
const CODE_LENGTH = Number(process.env.NEXT_PUBLIC_OTP_LENGTH) || 8;
const MIN_LENGTH = 6;
const MAX_LENGTH = 10;
const RESEND_SECONDS = 120;

// "Enter the code we emailed you." Used when signing up, when logging
// in with an unconfirmed address, and when an older account verifies its email.
export default function VerifyCodeForm({
  email,
  type,
  message,
  onVerified,
  onResend,
  onBack,
}: {
  email: string;
  type: "signup" | "email_change" | "recovery";
  // Overrides "We sent a code to …" (the password reset says it neutrally).
  message?: string;
  onVerified: () => void;
  onResend: () => Promise<boolean>;
  onBack?: () => void;
}) {
  const { t } = useI18n();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);
  const input = useRef<HTMLInputElement>(null);

  // The resend button unlocks after two minutes (the email is often slow, and
  // people should check spam before asking for a new one).
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  async function verify(value: string) {
    if (value.length < MIN_LENGTH || busy) return;
    setBusy(true);
    setError("");
    setNote("");
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: value, type });
    if (verifyError) {
      setBusy(false);
      setError(t("verify.wrong"));
      setCode("");
      input.current?.focus();
      return;
    }
    onVerified();
  }

  function handleChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, MAX_LENGTH);
    setCode(digits);
    setError("");
    // Verify as soon as the last digit is in.
    if (digits.length === CODE_LENGTH) void verify(digits);
  }

  async function resend() {
    setNote("");
    setError("");
    const ok = await onResend();
    if (ok) {
      setNote(t("verify.resent"));
      setCooldown(RESEND_SECONDS);
    } else {
      setError(t("verify.resendFailed"));
    }
  }

  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        void verify(code);
      }}
      className="space-y-4"
    >
      <p className="text-center text-sm text-muted">
        {message ?? t("verify.sent", { email })}
      </p>

      <input
        ref={input}
        value={code}
        onChange={(e) => handleChange(e.target.value)}
        inputMode="numeric"
        data-large
        autoComplete="one-time-code"
        autoFocus
        maxLength={MAX_LENGTH}
        placeholder={"•".repeat(CODE_LENGTH)}
        aria-label={t("verify.codeLabel")}
        className="block h-14 w-full rounded-xl border border-card-border bg-transparent text-center text-2xl font-semibold tracking-[0.35em] outline-none transition placeholder:text-muted/40 focus:border-accent focus:ring-2 focus:ring-accent-soft"
      />

      {error && (
        <p role="alert" className="text-center text-sm text-red-500">
          {error}
        </p>
      )}
      {note && (
        <p role="status" className="text-center text-sm text-accent">
          {note}
        </p>
      )}

      <button
        type="submit"
        disabled={busy || code.length < MIN_LENGTH}
        className="h-11 w-full rounded-xl bg-accent text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
      >
        {busy ? t("verify.verifying") : t("verify.submit")}
      </button>

      <div className="flex items-center justify-between text-xs text-muted">
        {onBack ? (
          <button type="button" onClick={onBack} className="transition hover:text-foreground">
            {t("verify.back")}
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={resend}
          disabled={cooldown > 0}
          className="font-medium text-accent transition hover:text-accent-hover disabled:text-muted"
        >
          {cooldown > 0 ? t("verify.resendIn", { n: cooldown }) : t("verify.resend")}
        </button>
      </div>

      <p className="text-center text-xs text-muted">{t("verify.spamHint")}</p>
    </form>
  );
}
