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
import { Card, Page, SectionTitle } from "@/components/form-ui";
import { ClockIcon, PeopleIcon, PinIcon, SettingsIcon } from "@/components/meta-icons";
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
    supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", id)
      .order("joined_at", { ascending: true }),
    supabase.rpc("can_join_group", { gid: id, uid: user.id }),
    getGroupMemberCount(supabase, id),
  ]);

  const memberIds = (memberRows ?? []).map((r) => r.user_id);
  const isMember = memberIds.includes(user.id);
  const profiles = await getProfilesByIds(supabase, memberIds);
  // Oldest member first (the owner), like the avatars on the group card.
  const members = memberIds
    .map((mid) => profiles.find((p) => p.id === mid))
    .filter((p): p is (typeof profiles)[number] => Boolean(p));
  const isFull = typedGroup.max_members ? memberCount >= typedGroup.max_members : false;
  const dateLabel = formatDate(typedGroup.event_date, lang);
  const canInvite = isMember && (typedGroup.visibility !== "invite" || isOwner);

  return (
    <Page>
      <Link
        href="/groups"
        className="inline-block text-sm font-medium text-muted transition hover:text-foreground"
      >
        {t("group.backToMine")}
      </Link>

      <Card>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold leading-snug">{typedGroup.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {typedGroup.course_code && (
                <span className="rounded-lg bg-accent-soft px-2 py-1 text-xs font-medium text-accent">
                  {typedGroup.course_code}
                </span>
              )}
              <span className="rounded-lg border border-card-border px-2 py-1 text-xs text-muted">
                {t(VISIBILITY_KEYS[typedGroup.visibility])}
              </span>
              {isFull && (
                <span className="rounded-lg bg-foreground px-2 py-1 text-xs font-medium text-background">
                  {t("group.fullBadge")}
                </span>
              )}
            </div>
          </div>
          {isOwner && (
            <Link
              href={`/groups/${typedGroup.id}/settings`}
              aria-label={t("group.settingsAria")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-card-border text-muted transition hover:bg-accent-soft hover:text-foreground active:scale-95"
            >
              <SettingsIcon className="h-[18px] w-[18px]" />
            </Link>
          )}
        </div>

        {typedGroup.description && (
          <p className="whitespace-pre-line break-words text-sm">{typedGroup.description}</p>
        )}

        <ul className="space-y-2 text-sm text-muted">
          <li className="flex items-center gap-2.5">
            <PeopleIcon className="h-4 w-4 shrink-0" />
            {typedGroup.max_members
              ? t("group.membersMax", { count: memberCount, max: typedGroup.max_members })
              : t("group.members", { count: memberCount })}
          </li>
          {typedGroup.location && (
            <li className="flex items-center gap-2.5">
              <PinIcon className="h-4 w-4 shrink-0" />
              {typedGroup.location}
            </li>
          )}
          {dateLabel && (
            <li className="flex items-center gap-2.5">
              <ClockIcon className="h-4 w-4 shrink-0" />
              {dateLabel}
              {typedGroup.event_time
                ? ` ${t("group.atTime", { time: typedGroup.event_time.slice(0, 5) })}`
                : ""}
            </li>
          )}
        </ul>

        <div className="pt-1">
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
            <p className="mt-2 text-xs text-muted">
              {typedGroup.visibility === "invite"
                ? t("group.mustBeInvited")
                : t("group.mustFollowOwner")}
            </p>
          )}
        </div>
      </Card>

      {canInvite && <GroupInvitePanel groupId={typedGroup.id} excludeIds={memberIds} />}

      <section>
        <SectionTitle>{t("group.membersHeading")}</SectionTitle>
        <div className="rounded-2xl border border-card-border bg-card p-2">
          <ProfileList
            profiles={members}
            emptyLabel={
              memberCount > 0 && !isMember
                ? t("group.memberListHidden")
                : t("group.noMembers")
            }
          />
        </div>
      </section>
    </Page>
  );
}
