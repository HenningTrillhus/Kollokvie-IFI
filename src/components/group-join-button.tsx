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
  leaveGoesToList,
}: {
  groupId: string;
  currentUserId: string;
  isMember: boolean;
  isFull: boolean;
  canJoin: boolean;
  // Private / invite-only groups vanish for you once you leave.
  leaveGoesToList: boolean;
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
      setErrorMessage(
        error.message.includes("full") ? t("group.fullError") : t("group.joinError")
      );
      return;
    }
    router.refresh();
  }

  async function leave() {
    setBusy(true);
    setErrorMessage("");
    const supabase = createClient();
    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", currentUserId);

    setBusy(false);
    if (error) {
      setErrorMessage(t("common.somethingWrong"));
      return;
    }
    if (leaveGoesToList) router.push("/groups");
    router.refresh();
  }

  const base =
    "h-11 w-full rounded-xl text-sm font-medium transition active:scale-[0.99] disabled:opacity-60";

  return (
    <div className="w-full">
      {isMember ? (
        <button
          onClick={leave}
          disabled={busy}
          className={`${base} border border-card-border hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500`}
        >
          {busy ? "…" : t("group.leave")}
        </button>
      ) : (
        <button
          onClick={join}
          disabled={busy || isFull || !canJoin}
          className={`${base} bg-accent text-white hover:bg-accent-hover`}
        >
          {isFull ? t("group.joinFull") : busy ? "…" : t("group.join")}
        </button>
      )}
      {errorMessage && <p className="mt-2 text-xs text-red-500">{errorMessage}</p>}
    </div>
  );
}
