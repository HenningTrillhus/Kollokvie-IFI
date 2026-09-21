"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, Field, inputClass } from "@/components/form-ui";
import { MIN_PASSWORD_LENGTH } from "@/lib/passwords";
import { useI18n } from "@/lib/i18n/client";

// "Change password" for a signed-in user. Signs every other device out.
export default function ChangePasswordCard() {
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setDone(false);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t("auth.passwordShort", { min: MIN_PASSWORD_LENGTH }));
      return;
    }
    if (password !== confirm) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setSaving(false);
      setError(
        updateError.message.toLowerCase().includes("reauth")
          ? t("password.reauth")
          : t("reset.saveFailed")
      );
      return;
    }
    // Anyone else signed in with the old password is thrown out.
    await supabase.auth.signOut({ scope: "others" });

    setSaving(false);
    setPassword("");
    setConfirm("");
    setDone(true);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <Card>
        <h2 className="text-sm font-semibold">{t("password.title")}</h2>
        <Field label={t("reset.newPassword")} htmlFor="changePassword">
          <input
            id="changePassword"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label={t("auth.confirmPassword")} htmlFor="changePasswordConfirm">
          <input
            id="changePasswordConfirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
          />
        </Field>

        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}
        {done && (
          <p role="status" className="text-sm text-accent">
            {t("password.done")}
          </p>
        )}

        <button
          type="submit"
          disabled={saving || !password || !confirm}
          className="h-11 w-full rounded-xl border border-card-border text-sm font-medium transition hover:bg-accent-soft active:scale-[0.99] disabled:opacity-50"
        >
          {saving ? t("reset.saving") : t("password.change")}
        </button>
      </Card>
    </form>
  );
}
