import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/get-user";
import { getProfilesByIds } from "@/lib/profiles";
import type { Group } from "@/lib/groups";
import type { PendingGroupInvite } from "@/lib/group-invites";
import FollowRequestsInbox, {
  type PendingRequest,
} from "@/components/follow-requests-inbox";
import GroupInvitesInbox from "@/components/group-invites-inbox";
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

  return (
    <div className="mx-auto w-full max-w-lg px-6 py-10">
      <Link
        href="/profile"
        className="text-sm font-medium text-muted transition hover:text-foreground"
      >
        {t("profile.backToProfile")}
      </Link>

      <h1 className="mt-4 text-xl font-semibold">{t("inbox.title")}</h1>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-muted">
          {t("inbox.followRequests")}
        </h2>
        <FollowRequestsInbox
          key={followRequests.map((r) => r.followerId).join(",")}
          initialRequests={followRequests}
          currentUserId={user.id}
        />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-muted">
          {t("inbox.groupInvites")}
        </h2>
        <GroupInvitesInbox
          key={groupInvites.map((i) => i.group.id).join(",")}
          initialInvites={groupInvites}
        />
      </section>
    </div>
  );
}
