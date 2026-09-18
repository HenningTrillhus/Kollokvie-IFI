"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [ifiUsername, setIfiUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name);
        setUsername(profile.username);
        setIfiUsername(profile.ifi_username);
      }
      setLoading(false);
    })();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setErrorMessage("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const trimmedName = fullName.trim();
    const trimmedUsername = username.trim();

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: trimmedName, username: trimmedUsername })
      .eq("id", user.id);

    if (error) {
      setSaving(false);
      setErrorMessage(
        error.message.includes("duplicate")
          ? "Brukernavnet er allerede tatt."
          : error.message
      );
      return;
    }

    await supabase.auth.updateUser({
      data: { full_name: trimmedName, username: trimmedUsername },
    });

    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-sm px-6 py-10 text-sm text-muted">
        Laster…
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm px-6 py-10">
      <h1 className="text-xl font-semibold">Innstillinger</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium">
            Fullt navn
          </label>
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-card-border bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
          />
        </div>

        <div>
          <label htmlFor="username" className="mb-1.5 block text-sm font-medium">
            Brukernavn
          </label>
          <input
            id="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-card-border bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
          />
        </div>

        <div>
          <label
            htmlFor="ifiUsername"
            className="mb-1.5 block text-sm font-medium text-muted"
          >
            IFI-brukernavn
          </label>
          <input
            id="ifiUsername"
            type="text"
            disabled
            value={ifiUsername}
            className="w-full cursor-not-allowed rounded-xl border border-card-border bg-transparent px-4 py-2.5 text-sm text-muted opacity-70"
          />
          <p className="mt-1 text-xs text-muted">
            Kan ikke endres — det er dette du logger inn med.
          </p>
        </div>

        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
        {saved && <p className="text-sm text-accent">Lagret.</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
        >
          {saving ? "Lagrer…" : "Lagre"}
        </button>
      </form>
    </div>
  );
}
