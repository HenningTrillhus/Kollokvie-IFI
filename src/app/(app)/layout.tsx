import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/get-user";
import { getProfileById } from "@/lib/profiles";
import { getPendingInviteCount } from "@/lib/group-invites";
import TopNav from "@/components/top-nav";
import BottomNav from "@/components/bottom-nav";
import AppShell from "@/components/app-shell";
import AutoRefresh from "@/components/auto-refresh";
import SignedInToast from "@/components/signed-in-toast";
import { PRIVACY_VERSION } from "@/lib/privacy";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  const [profile, { count: pendingFollowCount }, pendingInviteCount] = await Promise.all([
    getProfileById(supabase, user.id),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("followee_id", user.id)
      .eq("status", "pending"),
    getPendingInviteCount(supabase, user.id),
  ]);
  const pendingRequestCount = (pendingFollowCount ?? 0) + pendingInviteCount;

  // Ask for consent to the current privacy policy first. Only enforced once
  // the database has the column, so an older database can't lock people out.
  if (profile && "privacy_version" in profile && profile.privacy_version !== PRIVACY_VERSION) {
    redirect("/samtykke");
  }

  return (
    <>
      <AppShell
        header={<TopNav profile={profile} pendingRequestCount={pendingRequestCount} />}
        bottom={<BottomNav />}
      >
        <AutoRefresh />
        {children}
      </AppShell>
      <SignedInToast profile={profile} />
    </>
  );
}
