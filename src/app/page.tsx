import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-24 h-80 w-80 rounded-full bg-accent-soft blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-accent-soft blur-3xl"
      />

      <div className="relative w-full max-w-sm text-center">
        <div className="mb-10">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-lg font-semibold text-white">
            K
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Kollokvie<span className="text-accent">@IFI</span>
          </h1>
          <p className="mt-2 text-sm text-muted">
            Finn og hold kontakt med kollokviegruppen din
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
          >
            Logg inn
          </Link>
          <Link
            href="/signup"
            className="block w-full rounded-xl border border-card-border px-4 py-2.5 text-sm font-medium transition hover:bg-accent-soft"
          >
            Registrer deg
          </Link>
        </div>

        <p className="mt-8 text-xs text-muted">
          Laget for studenter ved Institutt for informatikk, UiO
        </p>
      </div>
    </main>
  );
}
