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

  const base = "h-11 rounded-xl text-sm font-medium transition active:scale-[0.99] disabled:opacity-60";

  return (
    <div className="w-full">
      {confirming ? (
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`${base} flex-1 bg-red-500 text-white hover:bg-red-600`}
          >
            {deleting ? t("common.deleting") : t("group.deleteConfirm")}
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={deleting}
            className={`${base} border border-card-border px-4 hover:bg-accent-soft`}
          >
            {t("common.cancel")}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className={`${base} w-full border border-red-500/30 text-red-500 hover:bg-red-500/10`}
        >
          {t("group.delete")}
        </button>
      )}
      {errorMessage && <p className="mt-2 text-xs text-red-500">{errorMessage}</p>}
    </div>
  );
}
