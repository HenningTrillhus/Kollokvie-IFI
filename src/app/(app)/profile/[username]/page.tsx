import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  avatarStyle,
  getFollowCounts,
  getProfileByUsername,
  getProfilesByIds,
} from "@/lib/profiles";
import FollowButton from "@/components/follow-button";
import ProfileList from "@/components/profile-list";
import ProfileLinks from "@/components/profile-links";
import CourseChips from "@/components/course-chips";
import { getUserCourses } from "@/lib/courses";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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

  const initial = (profile.full_name || profile.username).charAt(0).toUpperCase();

  return (
    <div className="mx-auto w-full max-w-lg px-6 py-10">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            style={avatarStyle(profile.accent_color)}
            className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-semibold"
          >
            {initial}
          </div>
          <div>
            <h1 className="text-lg font-semibold">{profile.full_name}</h1>
            <p className="text-sm text-muted">@{profile.username}</p>
            {profile.study_program && (
              <p className="mt-1 text-xs text-muted">
                {profile.study_program}
                {profile.study_year ? ` · ${profile.study_year}. år` : ""}
              </p>
            )}
          </div>
        </div>
        <FollowButton targetUserId={profile.id} initialStatus={myStatus} />
      </div>

      <div className="mt-4 space-y-3">
        <ProfileLinks githubUrl={profile.github_url} linkedinUrl={profile.linkedin_url} />
        <CourseChips courses={courses} />
      </div>

      <div className="mt-6 flex gap-6 text-sm">
        <span>
          <span className="font-semibold">{counts.followers}</span>{" "}
          <span className="text-muted">følgere</span>
        </span>
        <span>
          <span className="font-semibold">{counts.following}</span>{" "}
          <span className="text-muted">følger</span>
        </span>
      </div>

      {iFollowThem ? (
        <>
          <section className="mt-8">
            <h2 className="mb-3 text-sm font-semibold text-muted">Følgere</h2>
            <ProfileList
              profiles={followerProfiles}
              emptyLabel="Ingen følgere ennå."
            />
          </section>

          <section className="mt-8">
            <h2 className="mb-3 text-sm font-semibold text-muted">Følger</h2>
            <ProfileList
              profiles={followingProfiles}
              emptyLabel={`@${profile.username} følger ingen ennå.`}
            />
          </section>
        </>
      ) : (
        <p className="mt-8 text-sm text-muted">
          Følg @{profile.username} for å se hvem de følger og blir fulgt av.
        </p>
      )}
    </div>
  );
}
