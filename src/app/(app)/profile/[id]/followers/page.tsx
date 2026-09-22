import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/get-user";
import {
  UUID_PATTERN,
  getFollowStatus,
  getFollowerProfiles,
  getFollowingProfiles,
  getProfileById,
} from "@/lib/profiles";
import ConnectionsView from "@/components/connections-view";
import BackButton from "@/components/back-button";
import { EmptyCard, Page } from "@/components/form-ui";
import { getT } from "@/lib/i18n/server";

// Someone else's followers, swipeable across to following: see
// ../../followers/page.tsx. Mirrors the access rules of profile/[id]/page.tsx.
export default async function OtherFollowersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getT();
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const profile = UUID_PATTERN.test(id) ? await getProfileById(supabase, id) : null;
  if (!profile) notFound();
  if (profile.id === user.id) redirect("/profile/followers");

  const hidden = profile.details_hidden === true;
  const shownName = profile.username ? `@${profile.username}` : profile.full_name;
  const myStatus = await getFollowStatus(supabase, user.id, profile.id);
  const iFollowThem = myStatus === "accepted";

  if (!iFollowThem) {
    return (
      <Page>
        <BackButton />
        <EmptyCard>
          {hidden
            ? t("profile.privateNotice", { name: profile.full_name })
            : t("profile.followToSee", { username: shownName })}
        </EmptyCard>
      </Page>
    );
  }

  const [followers, following] = await Promise.all([
    getFollowerProfiles(supabase, profile.id),
    getFollowingProfiles(supabase, profile.id),
  ]);

  return (
    <Page>
      <BackButton />
      <ConnectionsView
        followers={followers}
        following={following}
        emptyFollowers={t("profile.noFollowers")}
        emptyFollowing={t("profile.userFollowsNobody", { username: shownName })}
        initialTab="followers"
      />
    </Page>
  );
}
