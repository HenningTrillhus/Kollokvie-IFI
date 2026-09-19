import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/get-user";
import { getGroupMemberCounts, withFullGroupsLast, type Group } from "@/lib/groups";
import GroupBrowser from "@/components/group-browser";

export default async function DashboardPage() {
  const user = await getAuthUser();
  // Guaranteed by the (app) layout, which redirects unauthenticated requests.
  if (!user) return null;

  const supabase = await createClient();

  const { data: publicGroups } = await supabase
    .from("groups")
    .select("*")
    .in("visibility", ["public", "private"])
    .order("created_at", { ascending: false })
    .limit(100);

  const groups = (publicGroups ?? []) as Group[];
  const counts = await getGroupMemberCounts(
    supabase,
    groups.map((g) => g.id)
  );
  const items = withFullGroupsLast(
    groups.map((group, i) => ({ group, memberCount: counts[i] }))
  );

  return (
    <div className="mx-auto w-full max-w-lg px-6 py-6">
      <GroupBrowser items={items} />
    </div>
  );
}
