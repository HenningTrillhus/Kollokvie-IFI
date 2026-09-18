"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Status = "none" | "pending" | "accepted" | "loading";

export default function FollowButton({
  targetUserId,
  initialStatus,
}: {
  targetUserId: string;
  initialStatus?: "none" | "pending" | "accepted";
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(initialStatus ?? "loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (initialStatus) return;
    let cancelled = false;

    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("follows")
        .select("status")
        .eq("follower_id", user.id)
        .eq("followee_id", targetUserId)
        .maybeSingle();

      if (!cancelled) setStatus((data?.status as Status) ?? "none");
    })();

    return () => {
      cancelled = true;
    };
  }, [targetUserId, initialStatus]);

  async function follow() {
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("follows")
      .insert({ follower_id: user.id, followee_id: targetUserId });

    setBusy(false);
    if (!error) {
      setStatus("pending");
      router.refresh();
    }
  }

  async function unfollow() {
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("followee_id", targetUserId);

    setBusy(false);
    setStatus("none");
    router.refresh();
  }

  if (status === "loading") {
    return (
      <span className="inline-block h-8 w-24 animate-pulse rounded-lg bg-accent-soft" />
    );
  }

  if (status === "accepted") {
    return (
      <button
        onClick={unfollow}
        disabled={busy}
        className="rounded-lg border border-card-border px-3 py-1.5 text-xs font-medium transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500 disabled:opacity-60"
      >
        Følger
      </button>
    );
  }

  if (status === "pending") {
    return (
      <button
        onClick={unfollow}
        disabled={busy}
        className="rounded-lg border border-card-border px-3 py-1.5 text-xs font-medium text-muted transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500 disabled:opacity-60"
      >
        Forespørsel sendt
      </button>
    );
  }

  return (
    <button
      onClick={follow}
      disabled={busy}
      className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
    >
      Følg
    </button>
  );
}
