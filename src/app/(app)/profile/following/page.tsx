import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/get-user";
import { getFollowingProfiles } from "@/lib/profiles";
import ProfileList from "@/components/profile-list";
import BackButton from "@/components/back-button";
import { Page, cardClass } from "@/components/form-ui";
import { getT } from "@/lib/i18n/server";

// The full following list, for mobile: see profile/followers/page.tsx.
export default async function OwnFollowingPage() {
  const user = await getAuthUser();
  if (!user) return null;
  const { t } = await getT();

  const supabase = await createClient();
  const profiles = await getFollowingProfiles(supabase, user.id);

  return (
    <Page>
      <BackButton />
      <h1 className="text-xl font-semibold">{t("profile.tabFollowing")}</h1>
      <div className={`overflow-hidden p-2 ${cardClass}`}>
        <ProfileList profiles={profiles} emptyLabel={t("profile.followNobody")} />
      </div>
    </Page>
  );
}
