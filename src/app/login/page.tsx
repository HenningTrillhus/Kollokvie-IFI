"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import OtpInput from "./otp-input";

type Step = "email" | "code";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSendCode(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({ email });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setStep("code");
  }

  async function handleVerifyCode(code: string) {
    setLoading(true);
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    if (error) {
      setLoading(false);
      setErrorMessage("Feil kode. Sjekk e-posten og prøv igjen.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleResend() {
    setLoading(true);
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({ email });

    setLoading(false);
    if (error) setErrorMessage(error.message);
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
          {step === "code" ? (
            <div className="text-center">
              <h2 className="text-base font-medium">Bekreft e-posten din</h2>
              <p className="mt-2 text-sm text-muted">
                Vi har sendt en 6-sifret kode til{" "}
                <span className="font-medium text-foreground">{email}</span>
              </p>

              <div className="mt-6">
                <OtpInput disabled={loading} onSubmit={handleVerifyCode} />
              </div>

              {errorMessage && (
                <p className="mt-4 text-sm text-red-500">{errorMessage}</p>
              )}

              <div className="mt-6 flex items-center justify-center gap-4 text-sm">
                <button
                  onClick={() => {
                    setStep("email");
                    setErrorMessage("");
                  }}
                  className="font-medium text-muted hover:text-foreground"
                >
                  Bruk en annen e-post
                </button>
                <span className="text-card-border">·</span>
                <button
                  onClick={handleResend}
                  disabled={loading}
                  className="font-medium text-accent hover:text-accent-hover disabled:opacity-60"
                >
                  Send kode på nytt
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendCode} className="space-y-4">
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

              {errorMessage && (
                <p className="text-sm text-red-500">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
              >
                {loading ? "Sender kode…" : "Fortsett med e-post"}
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
