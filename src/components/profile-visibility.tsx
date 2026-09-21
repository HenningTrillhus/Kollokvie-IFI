"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Segmented from "@/components/segmented";
import { Card } from "@/components/form-ui";
import { useI18n } from "@/lib/i18n/client";

type Mode = "open" | "private";

// Open or private profile. Saved the moment you switch (no Save button), and
// enforced in the database: a private profile shows others only your name and icon.
export default function ProfileVisibility({
  userId,
  initialPrivate,
}: {
  userId: string;
  initialPrivate: boolean;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialPrivate ? "private" : "open");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function change(next: Mode) {
    if (next === mode || busy) return;
    const previous = mode;
    setMode(next);
    setError(false);
    setBusy(true);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ is_private: next === "private" })
      .eq("id", userId);
    setBusy(false);
    if (updateError) {
      setMode(previous);
      setError(true);
      return;
    }
    router.refresh();
  }

  return (
    <Card>
      <Segmented
        fill
        label={t("settings.visibility")}
        value={mode}
        disabled={busy}
        onChange={change}
        options={[
          { value: "open", label: t("settings.visOpen") },
          { value: "private", label: t("settings.visPrivate") },
        ]}
      />
      <p key={mode} className="animate-fade-in text-sm leading-relaxed text-muted">
        {mode === "open" ? t("settings.visOpenText") : t("settings.visPrivateText")}
      </p>
      {error && (
        <p role="alert" className="text-sm text-red-500">
          {t("common.somethingWrong")}
        </p>
      )}
    </Card>
  );
}
