import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/get-user";
import { getFollowerProfiles, getFollowingProfiles } from "@/lib/profiles";
import ConnectionsView from "@/components/connections-view";
import BackButton from "@/components/back-button";
import { Page } from "@/components/form-ui";
import { getT } from "@/lib/i18n/server";

// The people you follow, swipeable across to followers: see
// profile/followers/page.tsx.
export default async function OwnFollowingPage() {
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
        initialTab="following"
      />
    </Page>
  );
}
