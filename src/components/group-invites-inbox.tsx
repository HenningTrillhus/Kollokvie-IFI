"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";
import Avatar from "@/components/avatar";
import type { PendingGroupInvite } from "@/lib/group-invites";

export default function GroupInvitesInbox({
  initialInvites,
}: {
  initialInvites: PendingGroupInvite[];
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [invites, setInvites] = useState(initialInvites);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function respond(groupId: string, action: "accept" | "decline") {
    setBusyId(groupId);
    setErrorMessage("");
    const supabase = createClient();
    const { error } = await supabase.rpc(
      action === "accept" ? "accept_group_invite" : "decline_group_invite",
      { gid: groupId }
    );
    setBusyId(null);
    if (error) {
      setErrorMessage(
        error.message.includes("full") ? t("group.fullError") : t("common.somethingWrong")
      );
      return;
    }
    setInvites((prev) => prev.filter((i) => i.group.id !== groupId));
    router.refresh();
  }

  if (invites.length === 0) {
    return <p className="text-sm text-muted">{t("inbox.noInvites")}</p>;
  }

  return (
    <>
      {errorMessage && <p className="mb-2 text-sm text-red-500">{errorMessage}</p>}
    <ul className="space-y-2">
      {invites.map(({ group, inviter }) => (
        <li
          key={group.id}
          className={`flex items-center justify-between gap-3 rounded-xl border border-card-border px-4 py-3 transition-opacity ${
            busyId === group.id ? "opacity-50" : ""
          }`}
        >
          <Link href={`/groups/${group.id}`} className="flex min-w-0 items-center gap-3">
            {inviter && <Avatar profile={inviter} className="h-9 w-9 text-sm" />}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{group.name}</p>
              <p className="truncate text-xs text-muted">
                {inviter
                  ? t("inbox.invitedBy", { name: inviter.full_name })
                  : t("inbox.invitation")}
              </p>
            </div>
          </Link>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => respond(group.id, "accept")}
              disabled={busyId === group.id}
              className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
            >
              {t("common.accept")}
            </button>
            <button
              onClick={() => respond(group.id, "decline")}
              disabled={busyId === group.id}
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
