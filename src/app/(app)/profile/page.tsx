import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/get-user";
import {
  avatarStyle,
  getFollowCounts,
  getProfileById,
  getProfilesByIds,
} from "@/lib/profiles";
import { getPendingInviteCount } from "@/lib/group-invites";
import ProfileList from "@/components/profile-list";
import ProfileLinks from "@/components/profile-links";
import CourseChips from "@/components/course-chips";
import SignOutButton from "@/components/sign-out-button";
import { getUserCourses } from "@/lib/courses";

export default async function OwnProfilePage() {
  const user = await getAuthUser();
  if (!user) return null;

  const supabase = await createClient();
  const profile = await getProfileById(supabase, user.id);
  if (!profile) return null;

  const [
    counts,
    courses,
    { count: pendingFollowCount },
    pendingInviteCount,
    { data: followingRows },
    { data: followerRows },
  ] = await Promise.all([
    getFollowCounts(supabase, user.id),
    getUserCourses(supabase, user.id),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("followee_id", user.id)
      .eq("status", "pending"),
    getPendingInviteCount(supabase, user.id),
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
  ]);

  const [followingProfiles, followerProfiles] = await Promise.all([
    getProfilesByIds(supabase, (followingRows ?? []).map((r) => r.followee_id)),
    getProfilesByIds(supabase, (followerRows ?? []).map((r) => r.follower_id)),
  ]);

  const totalPending = (pendingFollowCount ?? 0) + pendingInviteCount;
  const initial = (profile.full_name || profile.username).charAt(0).toUpperCase();

  return (
    <div className="mx-auto w-full max-w-lg px-6 py-10">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div
            style={avatarStyle(profile.accent_color)}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-semibold"
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

      <Link
        href="/inbox"
        className="mt-6 flex items-center justify-between rounded-xl border border-card-border px-4 py-3 transition hover:bg-accent-soft"
      >
        <span className="text-sm font-medium">Innboks</span>
        {totalPending > 0 ? (
          <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-white">
            {totalPending}
          </span>
        ) : (
          <span className="text-xs text-muted">Ingenting nytt</span>
        )}
      </Link>

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
