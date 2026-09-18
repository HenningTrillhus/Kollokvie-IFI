import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileById } from "@/lib/profiles";
import TopNav from "@/components/top-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfileById(supabase, user.id);
  const { count: pendingRequestCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("followee_id", user.id)
    .eq("status", "pending");

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <TopNav profile={profile} pendingRequestCount={pendingRequestCount ?? 0} />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
