"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";

type Status = "none" | "pending" | "accepted" | "loading";

export default function FollowButton({
  targetUserId,
  currentUserId,
  initialStatus,
  size = "sm",
}: {
  targetUserId: string;
  currentUserId: string;
  initialStatus?: "none" | "pending" | "accepted";
  size?: "sm" | "lg";
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [status, setStatus] = useState<Status>(initialStatus ?? "loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (initialStatus) return;
    let cancelled = false;

    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("follows")
        .select("status")
        .eq("follower_id", currentUserId)
        .eq("followee_id", targetUserId)
        .maybeSingle();

      if (!cancelled) setStatus((data?.status as Status) ?? "none");
    })();

    return () => {
      cancelled = true;
    };
  }, [targetUserId, currentUserId, initialStatus]);

  // Optimistic: the button flips at once and goes back if the request fails.
  async function follow() {
    const previous = status;
    setStatus("pending");
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("follows")
      .insert({ follower_id: currentUserId, followee_id: targetUserId });
    setBusy(false);
    if (error) {
      setStatus(previous);
      return;
    }
    router.refresh();
  }

  async function unfollow() {
    const previous = status;
    setStatus("none");
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", currentUserId)
      .eq("followee_id", targetUserId);
    setBusy(false);
    if (error) {
      setStatus(previous);
      return;
    }
    router.refresh();
  }

  const shape =
    size === "lg"
      ? "h-10 flex-1 rounded-xl px-4 text-sm"
      : "rounded-lg px-3 py-1.5 text-xs";
  const base = `${shape} font-medium transition active:scale-[0.97] disabled:opacity-60`;
  const danger = "hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500";

  if (status === "loading") {
    return (
      <span
        className={`inline-block animate-pulse bg-accent-soft ${
          size === "lg" ? "h-10 flex-1 rounded-xl" : "h-8 w-24 rounded-lg"
        }`}
      />
    );
  }

  if (status === "accepted") {
    return (
      <button
        onClick={unfollow}
        disabled={busy}
        className={`${base} border border-card-border ${danger}`}
      >
        {t("follow.following")}
      </button>
    );
  }

  if (status === "pending") {
    return (
      <button
        onClick={unfollow}
        disabled={busy}
        className={`${base} border border-card-border text-muted ${danger}`}
      >
        {t("follow.requested")}
      </button>
    );
  }

  return (
    <button
      onClick={follow}
      disabled={busy}
      className={`${base} bg-accent text-white hover:bg-accent-hover`}
    >
      {t("follow.follow")}
    </button>
  );
}
