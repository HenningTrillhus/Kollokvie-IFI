"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/avatar";
import { EmptyCard, ListCard } from "@/components/form-ui";
import { useI18n } from "@/lib/i18n/client";
import type { PendingGroupInvite } from "@/lib/group-invites";

export default function GroupInvitesInbox({
  initialInvites,
}: {
  initialInvites: PendingGroupInvite[];
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [invites, setInvites] = useState(initialInvites);
  const [errorMessage, setErrorMessage] = useState("");

  // Optimistic: the row disappears at once, and comes back if it failed.
  async function respond(groupId: string, action: "accept" | "decline") {
    const before = invites;
    setErrorMessage("");
    setInvites((prev) => prev.filter((i) => i.group.id !== groupId));

    const supabase = createClient();
    const { error } = await supabase.rpc(
      action === "accept" ? "accept_group_invite" : "decline_group_invite",
      { gid: groupId }
    );
    if (error) {
      setInvites(before);
      setErrorMessage(
        error.message.includes("full") ? t("group.fullError") : t("common.somethingWrong")
      );
      return;
    }
    router.refresh();
  }

  if (invites.length === 0) {
    return (
      <>
        {errorMessage && <p className="mb-2 text-sm text-red-500">{errorMessage}</p>}
        <EmptyCard>{t("inbox.noInvites")}</EmptyCard>
      </>
    );
  }

  return (
    <>
      {errorMessage && <p className="mb-2 text-sm text-red-500">{errorMessage}</p>}
      <ListCard>
        {invites.map(({ group, inviter }) => (
          <div
            key={group.id}
            className="space-y-3 px-4 py-3"
          >
            <Link href={`/groups/${group.id}`} className="flex min-w-0 items-center gap-3">
              {inviter && <Avatar profile={inviter} className="h-10 w-10 text-sm" />}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{group.name}</p>
                <p className="truncate text-xs text-muted">
                  {inviter
                    ? t("inbox.invitedBy", { name: inviter.full_name })
                    : t("inbox.invitation")}
                </p>
              </div>
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => respond(group.id, "accept")}
                className="h-9 rounded-xl bg-accent text-sm font-medium text-white transition hover:bg-accent-hover active:scale-95"
              >
                {t("common.accept")}
              </button>
              <button
                onClick={() => respond(group.id, "decline")}
                className="h-9 rounded-xl border border-card-border text-sm font-medium transition hover:bg-accent-soft active:scale-95"
              >
                {t("common.decline")}
              </button>
            </div>
          </div>
        ))}
      </ListCard>
    </>
  );
}
