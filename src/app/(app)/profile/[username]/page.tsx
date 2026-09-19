import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/get-user";
import {
  getFollowCounts,
  getProfileByUsername,
  getProfilesByIds,
} from "@/lib/profiles";
import FollowButton from "@/components/follow-button";
import ProfileList from "@/components/profile-list";
import ProfileHeader from "@/components/profile-header";
import SwipeTabs from "@/components/swipe-tabs";
import BackButton from "@/components/back-button";
import { EmptyCard, Page } from "@/components/form-ui";
import { getUserCourses } from "@/lib/courses";
import { getT } from "@/lib/i18n/server";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username: rawUsername } = await params;
  let username = rawUsername;
  try {
    username = decodeURIComponent(rawUsername);
  } catch {
    // already decoded / malformed: use as-is
  }
  const { t } = await getT();
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const profile = await getProfileByUsername(supabase, username);
  if (!profile) notFound();
  if (profile.id === user.id) redirect("/profile");

  const [counts, courses, { data: myFollowRow }] = await Promise.all([
    getFollowCounts(supabase, profile.id),
    getUserCourses(supabase, profile.id),
    supabase
      .from("follows")
      .select("status")
      .eq("follower_id", user.id)
      .eq("followee_id", profile.id)
      .maybeSingle(),
  ]);
  const myStatus = (myFollowRow?.status as "pending" | "accepted" | undefined) ?? "none";
  const iFollowThem = myStatus === "accepted";

  // Only people who follow this user can see their bio and their follow lists
  // (also enforced by RLS).
  let bio: string | null = null;
  let followingProfiles: Awaited<ReturnType<typeof getProfilesByIds>> = [];
  let followerProfiles: Awaited<ReturnType<typeof getProfilesByIds>> = [];

  if (iFollowThem) {
    const [{ data: bioRow }, { data: followingRows }, { data: followerRows }] =
      await Promise.all([
        supabase
          .from("profile_bios")
          .select("bio")
          .eq("user_id", profile.id)
          .maybeSingle(),
        supabase
          .from("follows")
          .select("followee_id")
          .eq("follower_id", profile.id)
          .eq("status", "accepted"),
        supabase
          .from("follows")
          .select("follower_id")
          .eq("followee_id", profile.id)
          .eq("status", "accepted"),
      ]);
    bio = bioRow?.bio ?? null;
    [followingProfiles, followerProfiles] = await Promise.all([
      getProfilesByIds(supabase, (followingRows ?? []).map((r) => r.followee_id)),
      getProfilesByIds(supabase, (followerRows ?? []).map((r) => r.follower_id)),
    ]);
  }

  return (
    <Page>
      <BackButton />

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
                    username: profile.username,
                  })}
                />
              ),
            },
          ]}
        />
      ) : (
        <EmptyCard>{t("profile.followToSee", { username: profile.username })}</EmptyCard>
      )}
    </Page>
  );
}
