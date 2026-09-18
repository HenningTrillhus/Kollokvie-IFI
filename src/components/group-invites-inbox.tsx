"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { avatarStyle } from "@/lib/profiles";
import type { PendingGroupInvite } from "@/lib/group-invites";

export default function GroupInvitesInbox({
  initialInvites,
}: {
  initialInvites: PendingGroupInvite[];
}) {
  const router = useRouter();
  const [invites, setInvites] = useState(initialInvites);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function respond(groupId: string, action: "accept" | "decline") {
    setBusyId(groupId);
    const supabase = createClient();
    await supabase.rpc(
      action === "accept" ? "accept_group_invite" : "decline_group_invite",
      { gid: groupId }
    );
    setInvites((prev) => prev.filter((i) => i.group.id !== groupId));
    setBusyId(null);
    router.refresh();
  }

  if (invites.length === 0) {
    return <p className="text-sm text-muted">Ingen nye gruppeinvitasjoner.</p>;
  }

  return (
    <ul className="space-y-2">
      {invites.map(({ group, inviter }) => (
        <li
          key={group.id}
          className={`flex items-center justify-between gap-3 rounded-xl border border-card-border px-4 py-3 transition-opacity ${
            busyId === group.id ? "opacity-50" : ""
          }`}
        >
          <Link href={`/groups/${group.id}`} className="flex min-w-0 items-center gap-3">
            {inviter && (
              <div
                style={avatarStyle(inviter.accent_color)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
              >
                {(inviter.full_name || inviter.username).charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{group.name}</p>
              <p className="truncate text-xs text-muted">
                {inviter ? `Invitert av ${inviter.full_name}` : "Invitasjon"}
              </p>
            </div>
          </Link>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => respond(group.id, "accept")}
              disabled={busyId === group.id}
              className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
            >
              Godta
            </button>
            <button
              onClick={() => respond(group.id, "decline")}
              disabled={busyId === group.id}
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
