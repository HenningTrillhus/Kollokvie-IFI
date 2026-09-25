"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";

export default function DeleteGroupButton({ groupId }: { groupId: string }) {
  const router = useRouter();
  const { t } = useI18n();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setErrorMessage("");
    const supabase = createClient();
    const { error } = await supabase.rpc("delete_group", { gid: groupId });
    if (error) {
      setDeleting(false);
      setErrorMessage(t("common.somethingWrong"));
      return;
    }
    router.push("/groups");
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-red-500/30 bg-card p-4">
      <h2 className="text-sm font-semibold text-red-500">{t("group.delete")}</h2>
      <p className="mt-1 text-xs text-muted">{t("group.deleteHint")}</p>
      {errorMessage && (
        <p role="alert" className="mt-2 text-xs text-red-500">
          {errorMessage}
        </p>
      )}

      {confirming ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="h-9 rounded-xl bg-red-500 text-xs font-medium text-white transition hover:bg-red-600 active:scale-[0.98] disabled:opacity-60"
          >
            {deleting ? t("common.deleting") : t("group.deleteConfirm")}
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={deleting}
            className="h-9 rounded-xl border border-card-border text-xs font-medium transition hover:bg-accent-soft active:scale-[0.98]"
          >
            {t("common.cancel")}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="mt-3 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-500/10 active:scale-95"
        >
          {t("group.delete")}
        </button>
      )}
    </div>
  );
}
