"use client";

import { useRef, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import Collapsible from "@/components/collapsible";
import { Card, Field, inputClass } from "@/components/form-ui";
import { MIN_PASSWORD_LENGTH, checkPassword } from "@/lib/passwords";
import { StrengthBar, StrengthLabel } from "@/components/password-strength";
import { useI18n } from "@/lib/i18n/client";

// "Change password" for a signed-in user. Hidden until you ask for it, and it
// signs every other device out once the new password is saved.
export default function ChangePasswordCard() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const firstField = useRef<HTMLInputElement>(null);
  const strength = checkPassword(password);

  function openForm() {
    setDone(false);
    setError("");
    setOpen(true);
    // Wait for the panel to start opening, then put the cursor in the first field.
    setTimeout(() => firstField.current?.focus(), 120);
  }

  function closeForm() {
    setOpen(false);
    setPassword("");
    setConfirm("");
    setError("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    const strength = checkPassword(password);
    if (!strength.ok) {
      setError(t(strength.problem ?? "pw.simple", { min: MIN_PASSWORD_LENGTH }));
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
    closeForm();
    setDone(true);
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">{t("password.title")}</h2>
          <p className="mt-0.5 text-xs text-muted">{t("password.description")}</p>
        </div>
        {!open && (
          <button
            type="button"
            onClick={openForm}
            className="shrink-0 rounded-lg border border-card-border px-3 py-1.5 text-xs font-medium transition hover:bg-accent-soft active:scale-95"
          >
            {t("password.change")}
          </button>
        )}
      </div>

      {done && !open && (
        <p role="status" className="animate-pop text-sm text-accent">
          ✓ {t("password.done")}
        </p>
      )}

      <Collapsible open={open}>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <label htmlFor="changePassword" className="text-sm font-medium">
                {t("reset.newPassword")}
              </label>
              <StrengthLabel check={strength} />
            </div>
            <div className="relative">
              <input
                ref={firstField}
                id="changePassword"
                type="password"
                autoComplete="new-password"
                placeholder={t("pw.hint")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
              <StrengthBar check={strength} />
            </div>
          </div>
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

          <div className="grid grid-cols-2 gap-2">
            <button
              type="submit"
              disabled={saving || !password || !confirm}
              className="h-10 rounded-xl bg-accent text-sm font-medium text-white transition hover:bg-accent-hover active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? t("reset.saving") : t("reset.save")}
            </button>
            <button
              type="button"
              onClick={closeForm}
              disabled={saving}
              className="h-10 rounded-xl border border-card-border text-sm font-medium transition hover:bg-accent-soft active:scale-[0.98]"
            >
              {t("common.cancel")}
            </button>
          </div>
        </form>
      </Collapsible>
    </Card>
  );
}
