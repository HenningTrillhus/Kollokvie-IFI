import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfilesByIds } from "@/lib/profiles";
import { getGroupMemberCount, type Group } from "@/lib/groups";
import ProfileList from "@/components/profile-list";
import GroupJoinButton from "@/components/group-join-button";
import DeleteGroupButton from "@/components/delete-group-button";

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-");
  return `${day}.${month}.${year}`;
}

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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
  const dateLabel = formatDate(typedGroup.event_date);

  return (
    <div className="mx-auto w-full max-w-lg px-6 py-10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold">{typedGroup.name}</h1>
          {typedGroup.description && (
            <p className="mt-1 text-sm text-muted">{typedGroup.description}</p>
          )}
        </div>
        {typedGroup.course_code && (
          <span className="shrink-0 rounded-lg bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
            {typedGroup.course_code}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted">
        <span>
          {memberCount}
          {typedGroup.max_members ? ` / ${typedGroup.max_members}` : ""} medlemmer
        </span>
        {typedGroup.location && <span>{typedGroup.location}</span>}
        {dateLabel && (
          <span>
            {dateLabel}
            {typedGroup.event_time ? ` kl. ${typedGroup.event_time.slice(0, 5)}` : ""}
          </span>
        )}
        <span className="rounded-md border border-card-border px-1.5 py-0.5 text-xs">
          {typedGroup.visibility === "public" ? "Offentlig" : "Privat"}
        </span>
      </div>

      <div className="mt-6 flex items-center justify-between">
        {isOwner ? (
          <DeleteGroupButton groupId={typedGroup.id} />
        ) : (
          <GroupJoinButton
            groupId={typedGroup.id}
            isMember={isMember}
            isFull={isFull && !isMember}
            canJoin={Boolean(canJoinData)}
          />
        )}
        {!isOwner && !isMember && !canJoinData && (
          <p className="text-xs text-muted">
            Du må følge eieren for å bli med i denne private gruppa.
          </p>
        )}
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-muted">Medlemmer</h2>
        <ProfileList
          profiles={members}
          emptyLabel={
            memberCount > 0 && !isMember
              ? "Medlemslisten vises når du er med i gruppa."
              : "Ingen medlemmer ennå."
          }
        />
      </section>
    </div>
  );
}
