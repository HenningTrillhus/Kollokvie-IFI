import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Guaranteed by the (app) layout, which redirects unauthenticated requests.
  if (!user) return null;

  return (
    <div className="flex flex-1 items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold">
          Velkommen, {user.user_metadata.full_name ?? user.email}
        </h1>
        {user.user_metadata.username && (
          <p className="mt-1 text-sm text-muted">
            @{user.user_metadata.username}
          </p>
        )}
        <p className="mt-2 text-sm text-muted">
          Du er logget inn. Her kommer snart kollokviegruppene dine.
        </p>
      </div>
    </div>
  );
}
