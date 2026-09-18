"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    setStatus("sent");
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

      <div className="relative w-full max-w-sm">
        <div className="mb-10 text-center">
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

        <div className="rounded-2xl border border-card-border bg-card p-8 shadow-sm">
          {status === "sent" ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <h2 className="text-base font-medium">Sjekk innboksen din</h2>
              <p className="mt-2 text-sm text-muted">
                Vi har sendt en innloggingslenke til{" "}
                <span className="font-medium text-foreground">{email}</span>.
                Klikk på lenken for å logge inn.
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-6 text-sm font-medium text-accent hover:text-accent-hover"
              >
                Bruk en annen e-post
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium"
                >
                  E-post
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  placeholder="ola.nordmann@ifi.uio.no"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-card-border bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
                />
              </div>

              {status === "error" && (
                <p className="text-sm text-red-500">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
              >
                {status === "loading" ? "Sender lenke…" : "Fortsett med e-post"}
              </button>

              <p className="pt-1 text-center text-xs text-muted">
                Ny her? Du blir registrert automatisk første gang du logger
                inn.
              </p>
            </form>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-muted">
          Laget for studenter ved Institutt for informatikk, UiO
        </p>
      </div>
    </main>
  );
}
