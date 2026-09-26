import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/get-user";
import { getGroupCardData, isSessionOver, withFullGroupsLast, type Group } from "@/lib/groups";
import GroupBrowser from "@/components/group-browser";
import { Page } from "@/components/form-ui";
import { getT } from "@/lib/i18n/server";

export default async function DashboardPage() {
  const user = await getAuthUser();
  // Guaranteed by the (app) layout, which redirects unauthenticated requests.
  if (!user) return null;

  const { t } = await getT();
  const supabase = await createClient();

  const { data: publicGroups } = await supabase
    .from("groups")
    .select("*")
    .in("visibility", ["public", "private"])
    .order("created_at", { ascending: false })
    .limit(100);

  const now = new Date();
  // A session that already happened isn't worth discovering anymore — it
  // stays visible to its own members under "Mine kollokviegrupper", just
  // not here.
  const groups = (publicGroups ?? []).filter((g) => !isSessionOver(g, now)) as Group[];
  const items = withFullGroupsLast(await getGroupCardData(supabase, groups));

  return (
    <Page width="wide">
      <h1 className="sr-only">{t("nav.explore")}</h1>
      <GroupBrowser items={items} />
    </Page>
  );
}
