import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/get-user";
import { getGroupCardData, type Group } from "@/lib/groups";
import GroupCard from "@/components/group-card";
import { CardGrid, EmptyCard, Page } from "@/components/form-ui";
import { getT } from "@/lib/i18n/server";

export default async function GroupsPage() {
  const user = await getAuthUser();
  if (!user) return null;
  const { t } = await getT();

  const supabase = await createClient();
  const { data: memberRows } = await supabase
    .from("group_members")
    .select("groups(*)")
    .eq("user_id", user.id);

  const groups = (memberRows ?? [])
    .map((row) => (row as unknown as { groups: Group | null }).groups)
    .filter((g): g is Group => g !== null)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  const items = await getGroupCardData(supabase, groups);

  return (
    <Page width="wide">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">{t("nav.myGroups")}</h1>
        <Link
          href="/groups/new"
          className="rounded-xl bg-accent px-3.5 py-2 text-sm font-medium text-white transition hover:bg-accent-hover active:scale-95"
        >
          {t("group.create")}
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyCard>
          {t("group.none")}
          <Link
            href="/dashboard"
            className="mt-3 block font-medium text-accent transition hover:text-accent-hover"
          >
            {t("group.findOne")}
          </Link>
        </EmptyCard>
      ) : (
        <CardGrid>
          {items.map(({ group, memberCount, members }, i) => (
            <GroupCard
              key={group.id}
              group={group}
              memberCount={memberCount}
              members={members}
              index={i}
            />
          ))}
        </CardGrid>
      )}
    </Page>
  );
}
