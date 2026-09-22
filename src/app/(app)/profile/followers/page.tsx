import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/get-user";
import { getFollowerProfiles, getFollowingProfiles } from "@/lib/profiles";
import ConnectionsView from "@/components/connections-view";
import BackButton from "@/components/back-button";
import { Page } from "@/components/form-ui";
import { getT } from "@/lib/i18n/server";

// Your followers, swipeable across to following. Its own page (not just a
// tab on the profile) so it doesn't need scrolling past everything else,
// and has room for the search box.
export default async function OwnFollowersPage() {
  const user = await getAuthUser();
  if (!user) return null;
  const { t } = await getT();

  const supabase = await createClient();
  const [followers, following] = await Promise.all([
    getFollowerProfiles(supabase, user.id),
    getFollowingProfiles(supabase, user.id),
  ]);

  return (
    <Page>
      <BackButton />
      <ConnectionsView
        followers={followers}
        following={following}
        emptyFollowers={t("profile.noFollowers")}
        emptyFollowing={t("profile.followNobody")}
        initialTab="followers"
      />
    </Page>
  );
}
