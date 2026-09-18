import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  avatarStyle,
  getFollowCounts,
  getProfileById,
  getProfilesByIds,
} from "@/lib/profiles";
import FollowRequestsInbox, {
  type PendingRequest,
} from "@/components/follow-requests-inbox";
import ProfileList from "@/components/profile-list";
import ProfileLinks from "@/components/profile-links";
import CourseChips from "@/components/course-chips";
import SignOutButton from "@/components/sign-out-button";
import { getUserCourses } from "@/lib/courses";

export default async function OwnProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await getProfileById(supabase, user.id);
  if (!profile) return null;

  const [
    counts,
    courses,
    { data: followingRows },
    { data: followerRows },
    { data: pendingRows },
  ] = await Promise.all([
    getFollowCounts(supabase, user.id),
    getUserCourses(supabase, user.id),
    supabase
      .from("follows")
      .select("followee_id")
      .eq("follower_id", user.id)
      .eq("status", "accepted"),
    supabase
      .from("follows")
      .select("follower_id")
      .eq("followee_id", user.id)
      .eq("status", "accepted"),
    supabase
      .from("follows")
      .select("follower_id")
      .eq("followee_id", user.id)
      .eq("status", "pending"),
  ]);

  const [followingProfiles, followerProfiles, pendingProfiles] = await Promise.all([
    getProfilesByIds(supabase, (followingRows ?? []).map((r) => r.followee_id)),
    getProfilesByIds(supabase, (followerRows ?? []).map((r) => r.follower_id)),
    getProfilesByIds(supabase, (pendingRows ?? []).map((r) => r.follower_id)),
  ]);
  const pendingRequests: PendingRequest[] = (pendingRows ?? []).flatMap((r) => {
    const p = pendingProfiles.find((profile) => profile.id === r.follower_id);
    return p ? [{ followerId: r.follower_id, profile: p }] : [];
  });

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
            <p className="text-xs text-muted">IFI: {profile.ifi_username}</p>
            {profile.study_program && (
              <p className="mt-1 text-xs text-muted">
                {profile.study_program}
                {profile.study_year ? ` · ${profile.study_year}. år` : ""}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Link
            href="/profile/settings"
            className="rounded-lg border border-card-border px-3 py-1.5 text-sm font-medium transition hover:bg-accent-soft"
          >
            Innstillinger
          </Link>
          <SignOutButton />
        </div>
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

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-muted">
          Følgeforespørsler
        </h2>
        <FollowRequestsInbox initialRequests={pendingRequests} />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-muted">Følgere</h2>
        <ProfileList profiles={followerProfiles} emptyLabel="Ingen følgere ennå." />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-muted">Følger</h2>
        <ProfileList
          profiles={followingProfiles}
          emptyLabel="Du følger ingen ennå."
        />
      </section>
    </div>
  );
}
