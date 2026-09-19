"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";
import type { Profile } from "@/lib/profiles";
import Avatar from "@/components/avatar";

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
  const { t } = useI18n();
  const [requests, setRequests] = useState(initialRequests);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function respond(followerId: string, action: "accept" | "decline") {
    setBusyId(followerId);
    setErrorMessage("");
    const supabase = createClient();

    const { error } =
      action === "accept"
        ? await supabase
            .from("follows")
            .update({ status: "accepted" })
            .eq("follower_id", followerId)
            .eq("followee_id", currentUserId)
        : await supabase
            .from("follows")
            .delete()
            .eq("follower_id", followerId)
            .eq("followee_id", currentUserId);

    setBusyId(null);
    if (error) {
      setErrorMessage(t("common.somethingWrong"));
      return;
    }
    setRequests((prev) => prev.filter((r) => r.followerId !== followerId));
    router.refresh();
  }

  if (requests.length === 0) {
    return (
      <p className="text-sm text-muted">{t("inbox.noRequests")}</p>
    );
  }

  return (
    <>
      {errorMessage && <p className="mb-2 text-sm text-red-500">{errorMessage}</p>}
    <ul className="space-y-2">
      {requests.map((r) => (
        <li
          key={r.followerId}
          className={`flex items-center justify-between gap-3 rounded-xl border border-card-border px-4 py-2.5 transition-opacity ${
            busyId === r.followerId ? "opacity-50" : ""
          }`}
        >
          <Link
            href={`/profile/${encodeURIComponent(r.profile.username)}`}
            className="flex min-w-0 items-center gap-3"
          >
            <Avatar profile={r.profile} className="h-8 w-8 text-xs" />
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
              {t("common.accept")}
            </button>
            <button
              onClick={() => respond(r.followerId, "decline")}
              disabled={busyId === r.followerId}
              className="rounded-lg border border-card-border px-3 py-1.5 text-xs font-medium transition hover:bg-accent-soft disabled:opacity-60"
            >
              {t("common.decline")}
            </button>
          </div>
        </li>
      ))}
    </ul>
    </>
  );
}
