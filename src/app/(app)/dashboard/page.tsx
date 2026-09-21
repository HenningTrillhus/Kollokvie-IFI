import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/get-user";
import { getGroupCardData, withFullGroupsLast, type Group } from "@/lib/groups";
import GroupBrowser from "@/components/group-browser";
import { Page } from "@/components/form-ui";

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
  const items = withFullGroupsLast(await getGroupCardData(supabase, groups));

  return (
    <Page width="wide">
      <GroupBrowser items={items} />
    </Page>
  );
}
