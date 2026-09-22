import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/get-user";
import { getFollowCounts, getProfileById } from "@/lib/profiles";
import { getPendingInviteCount } from "@/lib/group-invites";
import ProfileHeader from "@/components/profile-header";
import SignOutButton from "@/components/sign-out-button";
import { ListCard, Page } from "@/components/form-ui";
import { ChevronRightIcon } from "@/components/meta-icons";
import { getUserCourses } from "@/lib/courses";
import { getT } from "@/lib/i18n/server";

export default async function OwnProfilePage() {
  const user = await getAuthUser();
  if (!user) return null;
  const { t } = await getT();

  const supabase = await createClient();
  const profile = await getProfileById(supabase, user.id);
  if (!profile) return null;

  const [counts, courses, { count: pendingFollowCount }, pendingInviteCount, { data: bioRow }] =
    await Promise.all([
      getFollowCounts(supabase, user.id),
      getUserCourses(supabase, user.id),
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("followee_id", user.id)
        .eq("status", "pending"),
      getPendingInviteCount(supabase, user.id),
      supabase.from("profile_bios").select("bio").eq("user_id", user.id).maybeSingle(),
    ]);

  const totalPending = (pendingFollowCount ?? 0) + pendingInviteCount;

  return (
    <Page>
      <ProfileHeader
        profile={profile}
        bio={bioRow?.bio ?? null}
        courses={courses}
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

      <ListCard>
        <Link
          href="/inbox"
          className="flex items-center justify-between px-4 py-3.5 transition hover:bg-accent-soft active:bg-accent-soft"
        >
          <span className="text-sm font-medium">{t("inbox.title")}</span>
          <span className="flex items-center gap-2">
            {totalPending > 0 ? (
              <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-white">
                {totalPending}
              </span>
            ) : (
              <span className="text-xs text-muted">{t("inbox.nothingNew")}</span>
            )}
            <ChevronRightIcon className="h-4 w-4 text-muted" />
          </span>
        </Link>
      </ListCard>
    </Page>
  );
}
