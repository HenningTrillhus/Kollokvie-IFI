import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/get-user";
import { getGroupMemberCount, type Group } from "@/lib/groups";
import GroupCard from "@/components/group-card";

export default async function GroupsPage() {
  const user = await getAuthUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: memberRows } = await supabase
    .from("group_members")
    .select("groups(*)")
    .eq("user_id", user.id);

  const groups = (memberRows ?? [])
    .map((row) => (row as unknown as { groups: Group | null }).groups)
    .filter((g): g is Group => g !== null)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  const counts = await Promise.all(
    groups.map((g) => getGroupMemberCount(supabase, g.id))
  );

  return (
    <div className="mx-auto w-full max-w-lg px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Mine kollokviegrupper</h1>
        <Link
          href="/groups/new"
          className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white transition hover:bg-accent-hover"
        >
          Lag kollokviegruppe
        </Link>
      </div>

      <div className="mt-6 space-y-2">
        {groups.length === 0 && (
          <p className="text-sm text-muted">
            Du er ikke med i noen kollokviegrupper ennå.
          </p>
        )}
        {groups.map((group, i) => (
          <GroupCard key={group.id} group={group} memberCount={counts[i]} />
        ))}
      </div>
    </div>
  );
}
