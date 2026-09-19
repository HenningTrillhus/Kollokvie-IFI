"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";

export default function GroupJoinButton({
  groupId,
  currentUserId,
  isMember,
  isFull,
  canJoin,
}: {
  groupId: string;
  currentUserId: string;
  isMember: boolean;
  isFull: boolean;
  canJoin: boolean;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function join() {
    setBusy(true);
    setErrorMessage("");
    const supabase = createClient();
    const { error } = await supabase
      .from("group_members")
      .insert({ group_id: groupId, user_id: currentUserId });

    setBusy(false);
    if (error) {
      setErrorMessage(t("group.joinError"));
      return;
    }
    router.refresh();
  }

  async function leave() {
    setBusy(true);
    setErrorMessage("");
    const supabase = createClient();
    await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", currentUserId);

    setBusy(false);
    router.refresh();
  }

  if (isMember) {
    return (
      <button
        onClick={leave}
        disabled={busy}
        className="rounded-lg border border-card-border px-3 py-1.5 text-sm font-medium transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500 disabled:opacity-60"
      >
        {busy ? "…" : t("group.leave")}
      </button>
    );
  }

  return (
    <div className="text-right">
      <button
        onClick={join}
        disabled={busy || isFull || !canJoin}
        className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
      >
        {isFull ? t("group.joinFull") : busy ? "…" : t("group.join")}
      </button>
      {errorMessage && <p className="mt-1 text-xs text-red-500">{errorMessage}</p>}
    </div>
  );
}
