"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";
import { PRIVACY_VERSION } from "@/lib/privacy";

export default function ConsentActions({ userId }: { userId: string }) {
  const router = useRouter();
  const { t } = useI18n();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function accept() {
    setSaving(true);
    setError("");
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        privacy_version: PRIVACY_VERSION,
        privacy_accepted_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      setSaving(false);
      setError(t("consent.error"));
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function decline() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        onClick={accept}
        disabled={saving}
        className="h-11 w-full rounded-xl bg-accent text-sm font-medium text-white transition hover:bg-accent-hover active:scale-[0.99] disabled:opacity-60"
      >
        {saving ? t("consent.accepting") : t("consent.accept")}
      </button>
      <button
        onClick={decline}
        disabled={saving}
        className="h-11 w-full rounded-xl border border-card-border text-sm font-medium text-muted transition hover:bg-accent-soft active:scale-[0.99]"
      >
        {t("consent.decline")}
      </button>
      <p className="text-center text-xs text-muted">{t("consent.declineHint")}</p>
    </div>
  );
}
