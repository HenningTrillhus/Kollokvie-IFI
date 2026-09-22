import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/get-user";
import { getFollowerProfiles } from "@/lib/profiles";
import ProfileList from "@/components/profile-list";
import BackButton from "@/components/back-button";
import { Page, cardClass } from "@/components/form-ui";
import { getT } from "@/lib/i18n/server";

// The full followers list, for mobile: the same data the profile page's tab
// already shows, just its own page so it doesn't require scrolling past
// everything else first.
export default async function OwnFollowersPage() {
  const user = await getAuthUser();
  if (!user) return null;
  const { t } = await getT();

  const supabase = await createClient();
  const profiles = await getFollowerProfiles(supabase, user.id);

  return (
    <Page>
      <BackButton />
      <h1 className="text-xl font-semibold">{t("profile.tabFollowers")}</h1>
      <div className={`overflow-hidden p-2 ${cardClass}`}>
        <ProfileList profiles={profiles} emptyLabel={t("profile.noFollowers")} />
      </div>
    </Page>
  );
}
