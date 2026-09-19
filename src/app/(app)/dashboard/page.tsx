import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/get-user";
import { getProfileById } from "@/lib/profiles";
import { getGroupMemberCount, type Group } from "@/lib/groups";
import GroupCard from "@/components/group-card";
import RefreshButton from "@/components/refresh-button";

export default async function DashboardPage() {
  const user = await getAuthUser();
  // Guaranteed by the (app) layout, which redirects unauthenticated requests.
  if (!user) return null;

  const supabase = await createClient();

  const [profile, { data: publicGroups }] = await Promise.all([
    getProfileById(supabase, user.id),
    supabase
      .from("groups")
      .select("*")
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const groups = (publicGroups ?? []) as Group[];
  const counts = await Promise.all(
    groups.map((g) => getGroupMemberCount(supabase, g.id))
  );

  return (
    <div className="mx-auto w-full max-w-lg px-6 py-10">
      <div className="text-center">
        <h1 className="text-xl font-semibold">
          Velkommen, {profile?.full_name ?? user.email}
        </h1>
        {profile?.username && (
          <p className="mt-1 text-sm text-muted">@{profile.username}</p>
        )}
      </div>

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted">
            Offentlige kollokviegrupper
          </h2>
          <RefreshButton label="Oppdater grupper" />
        </div>
        {groups.length === 0 ? (
          <p className="text-sm text-muted">
            Ingen offentlige kollokviegrupper ennå — lag den første under
            &quot;Mine kollokviegrupper&quot;.
          </p>
        ) : (
          <div className="space-y-2">
            {groups.map((group, i) => (
              <GroupCard key={group.id} group={group} memberCount={counts[i]} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
