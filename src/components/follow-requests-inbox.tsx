"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { avatarStyle, type Profile } from "@/lib/profiles";

export type PendingRequest = {
  followerId: string;
  profile: Profile;
};

export default function FollowRequestsInbox({
  initialRequests,
  currentUserId,
}: {
  initialRequests: PendingRequest[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function respond(followerId: string, action: "accept" | "decline") {
    setBusyId(followerId);
    const supabase = createClient();

    if (action === "accept") {
      await supabase
        .from("follows")
        .update({ status: "accepted" })
        .eq("follower_id", followerId)
        .eq("followee_id", currentUserId);
    } else {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", followerId)
        .eq("followee_id", currentUserId);
    }

    setRequests((prev) => prev.filter((r) => r.followerId !== followerId));
    setBusyId(null);
    router.refresh();
  }

  if (requests.length === 0) {
    return (
      <p className="text-sm text-muted">Ingen nye følgeforespørsler.</p>
    );
  }

  return (
    <ul className="space-y-2">
      {requests.map((r) => (
        <li
          key={r.followerId}
          className={`flex items-center justify-between gap-3 rounded-xl border border-card-border px-4 py-2.5 transition-opacity ${
            busyId === r.followerId ? "opacity-50" : ""
          }`}
        >
          <Link
            href={`/profile/${r.profile.username}`}
            className="flex min-w-0 items-center gap-3"
          >
            <div
              style={avatarStyle(r.profile.accent_color)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
            >
              {(r.profile.full_name || r.profile.username).charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {r.profile.full_name}
              </p>
              <p className="truncate text-xs text-muted">@{r.profile.username}</p>
            </div>
          </Link>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => respond(r.followerId, "accept")}
              disabled={busyId === r.followerId}
              className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
            >
              Godta
            </button>
            <button
              onClick={() => respond(r.followerId, "decline")}
              disabled={busyId === r.followerId}
              className="rounded-lg border border-card-border px-3 py-1.5 text-xs font-medium transition hover:bg-accent-soft disabled:opacity-60"
            >
              Avslå
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
