import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/get-user";
import { getProfilesByIds } from "@/lib/profiles";
import type { Group } from "@/lib/groups";
import type { PendingGroupInvite } from "@/lib/group-invites";
import FollowRequestsInbox, {
  type PendingRequest,
} from "@/components/follow-requests-inbox";
import GroupInvitesInbox from "@/components/group-invites-inbox";
import BackButton from "@/components/back-button";
import { BellIcon } from "@/components/meta-icons";
import { Page } from "@/components/form-ui";
import { getT } from "@/lib/i18n/server";

export default async function InboxPage() {
  const user = await getAuthUser();
  if (!user) return null;
  const { t } = await getT();

  const supabase = await createClient();

  const [{ data: pendingFollowRows }, { data: inviteRows }] = await Promise.all([
    supabase
      .from("follows")
      .select("follower_id")
      .eq("followee_id", user.id)
      .eq("status", "pending"),
    supabase
      .from("group_invites")
      .select("group_id, inviter_id, groups(*)")
      .eq("invitee_id", user.id)
      .eq("status", "pending"),
  ]);

  const pendingProfiles = await getProfilesByIds(
    supabase,
    (pendingFollowRows ?? []).map((r) => r.follower_id)
  );
  const followRequests: PendingRequest[] = (pendingFollowRows ?? []).flatMap((r) => {
    const p = pendingProfiles.find((profile) => profile.id === r.follower_id);
    return p ? [{ followerId: r.follower_id, profile: p }] : [];
  });

  const inviterProfiles = await getProfilesByIds(
    supabase,
    (inviteRows ?? []).map((r) => r.inviter_id)
  );
  const groupInvites: PendingGroupInvite[] = (inviteRows ?? [])
    .map((r) => {
      const group = (r as unknown as { groups: Group | null }).groups;
      if (!group) return null;
      const inviter = inviterProfiles.find((p) => p.id === r.inviter_id) ?? null;
      return { group, inviter };
    })
    .filter((i): i is PendingGroupInvite => i !== null);

  const totalPending = followRequests.length + groupInvites.length;

  return (
    <Page>
      <BackButton />

      <div style={{ ["--i" as string]: 0 }} className="animate-rise flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
          <BellIcon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold leading-tight">{t("inbox.title")}</h1>
          <p className="truncate text-sm text-muted">
            {totalPending > 0 ? t("inbox.subtitleNew", { n: totalPending }) : t("inbox.nothingNew")}
          </p>
        </div>
      </div>

      <div style={{ ["--i" as string]: 1 }} className="animate-rise">
        <FollowRequestsInbox
          key={followRequests.map((r) => r.followerId).join(",")}
          initialRequests={followRequests}
          currentUserId={user.id}
        />
      </div>

      <div style={{ ["--i" as string]: 2 }} className="animate-rise">
        <GroupInvitesInbox
          key={groupInvites.map((i) => i.group.id).join(",")}
          initialInvites={groupInvites}
        />
      </div>
    </Page>
  );
}
