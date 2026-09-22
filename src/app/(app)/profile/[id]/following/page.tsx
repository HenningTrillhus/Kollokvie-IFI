import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/get-user";
import {
  UUID_PATTERN,
  getFollowStatus,
  getFollowingProfiles,
  getProfileById,
} from "@/lib/profiles";
import ProfileList from "@/components/profile-list";
import BackButton from "@/components/back-button";
import { EmptyCard, Page, cardClass } from "@/components/form-ui";
import { getT } from "@/lib/i18n/server";

// Someone else's following list, for mobile: see ../followers/page.tsx.
export default async function OtherFollowingPage({
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
  if (profile.id === user.id) redirect("/profile/following");

  const hidden = profile.details_hidden === true;
  const shownName = profile.username ? `@${profile.username}` : profile.full_name;
  const myStatus = await getFollowStatus(supabase, user.id, profile.id);
  const iFollowThem = myStatus === "accepted";

  return (
    <Page>
      <BackButton />
      <h1 className="text-xl font-semibold">{t("profile.tabFollowing")}</h1>
      {iFollowThem ? (
        <div className={`overflow-hidden p-2 ${cardClass}`}>
          <ProfileList
            profiles={await getFollowingProfiles(supabase, profile.id)}
            emptyLabel={t("profile.userFollowsNobody", { username: shownName })}
          />
        </div>
      ) : (
        <EmptyCard>
          {hidden
            ? t("profile.privateNotice", { name: profile.full_name })
            : t("profile.followToSee", { username: shownName })}
        </EmptyCard>
      )}
    </Page>
  );
}
