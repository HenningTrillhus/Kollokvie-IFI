import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/get-user";
import { getFollowCounts, getProfileById } from "@/lib/profiles";
import { getUserAssociations } from "@/lib/associations";
import ProfileHeader from "@/components/profile-header";
import SignOutButton from "@/components/sign-out-button";
import { Page } from "@/components/form-ui";
import { getUserCourses } from "@/lib/courses";
import { getT } from "@/lib/i18n/server";

export default async function OwnProfilePage() {
  const user = await getAuthUser();
  if (!user) return null;
  const { t } = await getT();

  const supabase = await createClient();
  const profile = await getProfileById(supabase, user.id);
  if (!profile) return null;

  const [counts, courses, associations, { data: bioRow }] = await Promise.all([
    getFollowCounts(supabase, user.id),
    getUserCourses(supabase, user.id),
    getUserAssociations(supabase, user.id),
    supabase.from("profile_bios").select("bio").eq("user_id", user.id).maybeSingle(),
  ]);

  return (
    <Page>
      <ProfileHeader
        profile={profile}
        bio={bioRow?.bio ?? null}
        courses={courses}
        associations={associations}
        counts={counts}
        isOwn
        actions={
          <>
            <Link
              href="/profile/settings"
              className="flex h-10 flex-1 items-center justify-center rounded-xl border border-card-border text-sm font-medium transition hover:bg-accent-soft active:scale-[0.99]"
            >
              {t("profile.settings")}
            </Link>
            <SignOutButton />
          </>
        }
      />
    </Page>
  );
}
