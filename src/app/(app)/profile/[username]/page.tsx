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
import Avatar from "@/components/avatar";
import SwipeTabs from "@/components/swipe-tabs";
import ProfileLinks from "@/components/profile-links";
import CourseChips from "@/components/course-chips";
import BackButton from "@/components/back-button";
import { getUserCourses } from "@/lib/courses";
import { programLabel } from "@/lib/i18n";
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
  const { t, lang } = await getT();
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

  let followingProfiles: Awaited<ReturnType<typeof getProfilesByIds>> = [];
  let followerProfiles: Awaited<ReturnType<typeof getProfilesByIds>> = [];

  if (iFollowThem) {
    const [{ data: followingRows }, { data: followerRows }] = await Promise.all([
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
    followingProfiles = await getProfilesByIds(
      supabase,
      (followingRows ?? []).map((r) => r.followee_id)
    );
    followerProfiles = await getProfilesByIds(
      supabase,
      (followerRows ?? []).map((r) => r.follower_id)
    );
  }


  return (
    <div className="mx-auto w-full max-w-lg px-6 py-10">
      <BackButton />

      <div className="mt-4 flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Avatar profile={profile} className="h-14 w-14 text-xl" />
          <div>
            <h1 className="text-lg font-semibold">{profile.full_name}</h1>
            <p className="text-sm text-muted">@{profile.username}</p>
            {profile.study_program && (
              <p className="mt-1 text-xs text-muted">
                {programLabel(lang, profile.study_program)}
                {profile.study_year
                  ? ` · ${t("profile.year", { n: profile.study_year })}`
                  : ""}
              </p>
            )}
          </div>
        </div>
        <FollowButton
          key={myStatus}
          targetUserId={profile.id}
          currentUserId={user.id}
          initialStatus={myStatus}
        />
      </div>

      <div className="mt-4 space-y-3">
        <ProfileLinks githubUrl={profile.github_url} linkedinUrl={profile.linkedin_url} />
        <CourseChips courses={courses} />
      </div>

      <div className="mt-6 flex gap-6 text-sm">
        <span>
          <span className="font-semibold">{counts.followers}</span>{" "}
          <span className="text-muted">{t("profile.followers")}</span>
        </span>
        <span>
          <span className="font-semibold">{counts.following}</span>{" "}
          <span className="text-muted">{t("profile.following")}</span>
        </span>
      </div>

      {iFollowThem ? (
        <div className="mt-8">
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
        </div>
      ) : (
        <p className="mt-8 text-sm text-muted">
          {t("profile.followToSee", { username: profile.username })}
        </p>
      )}
    </div>
  );
}
