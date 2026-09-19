import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/get-user";
import { getProfilesByIds } from "@/lib/profiles";
import { getGroupMemberCount, VISIBILITY_KEYS, type Group } from "@/lib/groups";
import ProfileList from "@/components/profile-list";
import GroupJoinButton from "@/components/group-join-button";
import DeleteGroupButton from "@/components/delete-group-button";
import GroupInvitePanel from "@/components/group-invite-panel";
import { formatDate } from "@/lib/i18n";
import { getT } from "@/lib/i18n/server";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t, lang } = await getT();
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: group } = await supabase
    .from("groups")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!group) notFound();

  const typedGroup = group as Group;
  const isOwner = typedGroup.owner_id === user.id;

  const [{ data: memberRows }, { data: canJoinData }, memberCount] = await Promise.all([
    supabase.from("group_members").select("user_id").eq("group_id", id),
    supabase.rpc("can_join_group", { gid: id, uid: user.id }),
    getGroupMemberCount(supabase, id),
  ]);

  const memberIds = (memberRows ?? []).map((r) => r.user_id);
  const isMember = memberIds.includes(user.id);
  const members = await getProfilesByIds(supabase, memberIds);
  const isFull = typedGroup.max_members ? memberCount >= typedGroup.max_members : false;
  const dateLabel = formatDate(typedGroup.event_date, lang);

  return (
    <div className="mx-auto w-full max-w-lg px-6 py-10">
      <Link
        href="/groups"
        className="text-sm font-medium text-muted transition hover:text-foreground"
      >
        {t("group.backToMine")}
      </Link>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold">{typedGroup.name}</h1>
          {typedGroup.description && (
            <p className="mt-1 text-sm text-muted">{typedGroup.description}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {typedGroup.course_code && (
            <span className="rounded-lg bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
              {typedGroup.course_code}
            </span>
          )}
          {isOwner && (
            <Link
              href={`/groups/${typedGroup.id}/settings`}
              aria-label={t("group.settingsAria")}
              className="rounded-lg border border-card-border px-2.5 py-1 text-xs font-medium transition hover:bg-accent-soft"
            >
              ⚙︎
            </Link>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted">
        <span>
          {typedGroup.max_members
            ? t("group.membersMax", { count: memberCount, max: typedGroup.max_members })
            : t("group.members", { count: memberCount })}
        </span>
        {typedGroup.location && <span>{typedGroup.location}</span>}
        {dateLabel && (
          <span>
            {dateLabel}
            {typedGroup.event_time
              ? ` ${t("group.atTime", { time: typedGroup.event_time.slice(0, 5) })}`
              : ""}
          </span>
        )}
        <span className="rounded-md border border-card-border px-1.5 py-0.5 text-xs">
          {t(VISIBILITY_KEYS[typedGroup.visibility])}
        </span>
      </div>

      <div className="mt-6 flex items-center justify-between">
        {isOwner ? (
          <DeleteGroupButton groupId={typedGroup.id} />
        ) : (
          <GroupJoinButton
            groupId={typedGroup.id}
            currentUserId={user.id}
            isMember={isMember}
            isFull={isFull && !isMember}
            canJoin={Boolean(canJoinData)}
            leaveGoesToList={typedGroup.visibility !== "public"}
          />
        )}
        {!isOwner && !isMember && !canJoinData && (
          <p className="text-xs text-muted">
            {typedGroup.visibility === "invite"
              ? t("group.mustBeInvited")
              : t("group.mustFollowOwner")}
          </p>
        )}
      </div>

      {isMember && (typedGroup.visibility !== "invite" || isOwner) && (
        <div className="mt-4">
          <GroupInvitePanel groupId={typedGroup.id} excludeIds={memberIds} />
        </div>
      )}

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-muted">
          {t("group.membersHeading")}
        </h2>
        <ProfileList
          profiles={members}
          emptyLabel={
            memberCount > 0 && !isMember
              ? t("group.memberListHidden")
              : t("group.noMembers")
          }
        />
      </section>
    </div>
  );
}
