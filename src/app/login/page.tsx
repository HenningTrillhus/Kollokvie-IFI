"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { emailForIfiUsername } from "@/lib/ifi-auth";

export default function LoginPage() {
  const router = useRouter();
  const [ifiUsername, setIfiUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: emailForIfiUsername(ifiUsername),
      password,
    });

    if (error) {
      setLoading(false);
      setErrorMessage("Feil IFI-brukernavn eller passord.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden px-6 py-16">

      <div className="relative w-full max-w-sm">
        <div className="mb-10 text-center">
          <Link
            href="/"
            className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-lg font-semibold text-white"
          >
            K
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Logg inn</h1>
          <p className="mt-2 text-sm text-muted">
            Kollokvie<span className="text-accent">@IFI</span>
          </p>
        </div>

        <div className="rounded-2xl border border-card-border bg-card p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="ifiUsername"
                className="mb-1.5 block text-sm font-medium"
              >
                IFI-brukernavn
              </label>
              <input
                id="ifiUsername"
                type="text"
                required
                autoFocus
                placeholder="olan"
                value={ifiUsername}
                onChange={(e) => setIfiUsername(e.target.value)}
                className="w-full rounded-xl border border-card-border bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium"
              >
                Passord
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-card-border bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
              />
            </div>

            {errorMessage && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
            >
              {loading ? "Logger inn…" : "Logg inn"}
            </button>

            <p className="pt-1 text-center text-xs text-muted">
              Ny her?{" "}
              <Link
                href="/signup"
                className="font-medium text-accent hover:text-accent-hover"
              >
                Registrer deg
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
