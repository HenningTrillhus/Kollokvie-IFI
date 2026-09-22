import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/get-user";
import {
  UUID_PATTERN,
  getFollowCounts,
  getFollowStatus,
  getFollowerProfiles,
  getFollowingProfiles,
  getProfileById,
  getProfileByUsername,
} from "@/lib/profiles";
import FollowButton from "@/components/follow-button";
import ProfileList from "@/components/profile-list";
import ProfileHeader from "@/components/profile-header";
import SwipeTabs from "@/components/swipe-tabs";
import BackButton from "@/components/back-button";
import { EmptyCard, Page } from "@/components/form-ui";
import { getUserCourses } from "@/lib/courses";
import { getT } from "@/lib/i18n/server";

// Someone else's profile. The address is their id. (Old links used the IFI
// username, which private profiles keep hidden, so those are forwarded.)
export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  let id = rawId;
  try {
    id = decodeURIComponent(rawId);
  } catch {
    // malformed: use as-is
  }
  const { t } = await getT();
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const profile = UUID_PATTERN.test(id) ? await getProfileById(supabase, id) : null;
  if (!profile && !UUID_PATTERN.test(id)) {
    const legacy = await getProfileByUsername(supabase, id);
    if (legacy) redirect(`/profile/${legacy.id}`);
  }
  if (!profile) notFound();
  if (profile.id === user.id) redirect("/profile");

  // A private profile is only a name and an icon to people who don't follow it.
  // (Enforced in the database: hidden fields come back empty.)
  const hidden = profile.details_hidden === true;
  const shownName = profile.username ? `@${profile.username}` : profile.full_name;

  const [counts, courses, myStatus] = await Promise.all([
    hidden ? Promise.resolve(undefined) : getFollowCounts(supabase, profile.id),
    hidden ? Promise.resolve([]) : getUserCourses(supabase, profile.id),
    getFollowStatus(supabase, user.id, profile.id),
  ]);
  const iFollowThem = myStatus === "accepted";

  // The bio follows the profile's visibility (also enforced by RLS). The
  // follow lists are only for people who follow this user.
  let bio: string | null = null;
  let followingProfiles: Awaited<ReturnType<typeof getFollowingProfiles>> = [];
  let followerProfiles: Awaited<ReturnType<typeof getFollowerProfiles>> = [];

  if (!hidden) {
    const { data: bioRow } = await supabase
      .from("profile_bios")
      .select("bio")
      .eq("user_id", profile.id)
      .maybeSingle();
    bio = bioRow?.bio ?? null;
  }

  if (iFollowThem) {
    [followingProfiles, followerProfiles] = await Promise.all([
      getFollowingProfiles(supabase, profile.id),
      getFollowerProfiles(supabase, profile.id),
    ]);
  }

  return (
    <Page width="wide">
      <BackButton />

      <div className="space-y-4 lg:grid lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start lg:gap-5 lg:space-y-0">
        <ProfileHeader
          profile={profile}
          bio={bio}
          courses={courses}
          counts={counts}
          actions={
            <FollowButton
              key={myStatus}
              targetUserId={profile.id}
              currentUserId={user.id}
              initialStatus={myStatus}
              size="lg"
            />
          }
        />

        {iFollowThem ? (
          <SwipeTabs
            tabs={[
              {
                label: t("profile.tabFollowers"),
                count: followerProfiles.length,
                content: (
                  <ProfileList
                    profiles={followerProfiles}
                    emptyLabel={t("profile.noFollowers")}
                  />
                ),
              },
              {
                label: t("profile.tabFollowing"),
                count: followingProfiles.length,
                content: (
                  <ProfileList
                    profiles={followingProfiles}
                    emptyLabel={t("profile.userFollowsNobody", {
                      username: shownName,
                    })}
                  />
                ),
              },
            ]}
          />
        ) : (
          <EmptyCard>
            {hidden
              ? t("profile.privateNotice", { name: profile.full_name })
              : t("profile.followToSee", { username: shownName })}
          </EmptyCard>
        )}
      </div>
    </Page>
  );
}
