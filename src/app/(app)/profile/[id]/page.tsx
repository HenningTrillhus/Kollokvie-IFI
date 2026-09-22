import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/get-user";
import {
  UUID_PATTERN,
  getFollowCounts,
  getFollowStatus,
  getProfileById,
  getProfileByUsername,
} from "@/lib/profiles";
import FollowButton from "@/components/follow-button";
import ProfileHeader from "@/components/profile-header";
import BackButton from "@/components/back-button";
import { Page } from "@/components/form-ui";
import { getUserCourses } from "@/lib/courses";

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

  const [counts, courses, myStatus] = await Promise.all([
    hidden ? Promise.resolve(undefined) : getFollowCounts(supabase, profile.id),
    hidden ? Promise.resolve([]) : getUserCourses(supabase, profile.id),
    getFollowStatus(supabase, user.id, profile.id),
  ]);

  // The bio follows the profile's visibility (also enforced by RLS).
  let bio: string | null = null;
  if (!hidden) {
    const { data: bioRow } = await supabase
      .from("profile_bios")
      .select("bio")
      .eq("user_id", profile.id)
      .maybeSingle();
    bio = bioRow?.bio ?? null;
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
    </Page>
  );
}
