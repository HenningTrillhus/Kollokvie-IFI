import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/get-user";
import {
  UUID_PATTERN,
  getFollowCounts,
  getFollowStatus,
  getProfileById,
  getProfileByUsername,
} from "@/lib/profiles";
import { getUserAssociations } from "@/lib/associations";
import FollowButton from "@/components/follow-button";
import ProfileHeader from "@/components/profile-header";
import BackButton from "@/components/back-button";
import { FlagIcon } from "@/components/meta-icons";
import { Page } from "@/components/form-ui";
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

  const [counts, courses, myStatus] = await Promise.all([
    hidden ? Promise.resolve(undefined) : getFollowCounts(supabase, profile.id),
    hidden ? Promise.resolve([]) : getUserCourses(supabase, profile.id),
    getFollowStatus(supabase, user.id, profile.id),
  ]);

  // The bio and associations follow the profile's visibility (also enforced by RLS).
  let bio: string | null = null;
  let associations: Awaited<ReturnType<typeof getUserAssociations>> = [];
  if (!hidden) {
    const [{ data: bioRow }, assoc] = await Promise.all([
      supabase.from("profile_bios").select("bio").eq("user_id", profile.id).maybeSingle(),
      getUserAssociations(supabase, profile.id),
    ]);
    bio = bioRow?.bio ?? null;
    associations = assoc;
  }

  return (
    <Page>
      <BackButton />

      <ProfileHeader
        profile={profile}
        bio={bio}
        courses={courses}
        associations={associations}
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

      <Link
        href={`/profile/${profile.id}/rapporter`}
        className="flex items-center justify-center gap-1.5 text-xs text-muted transition hover:text-foreground"
      >
        <FlagIcon className="h-3.5 w-3.5" />
        {t("report.link")}
      </Link>
    </Page>
  );
}
