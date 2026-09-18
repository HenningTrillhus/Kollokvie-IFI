import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "./sign-out-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-card-border px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-white">
            K
          </div>
          <span className="font-semibold tracking-tight">
            Kollokvie<span className="text-accent">@IFI</span>
          </span>
        </div>
        <SignOutButton />
      </header>

      <div className="flex flex-1 items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold">
            Velkommen, {user.email}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Du er logget inn. Her kommer snart kollokviegruppene dine.
          </p>
        </div>
      </div>
    </main>
  );
}
