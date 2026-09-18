"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ACCENT_COLORS, STUDY_PROGRAMS, avatarStyle, sanitizeExternalUrl } from "@/lib/profiles";

const STUDY_YEARS = [1, 2, 3, 4, 5];

export default function SettingsPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [ifiUsername, setIfiUsername] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [studyProgram, setStudyProgram] = useState("");
  const [studyYear, setStudyYear] = useState("");
  const [accentColor, setAccentColor] = useState<string>(ACCENT_COLORS[0].value);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

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
        setGithubUrl(profile.github_url ?? "");
        setLinkedinUrl(profile.linkedin_url ?? "");
        setStudyProgram(profile.study_program ?? "");
        setStudyYear(profile.study_year ? String(profile.study_year) : "");
        setAccentColor(profile.accent_color ?? ACCENT_COLORS[0].value);
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
      .update({
        full_name: trimmedName,
        username: trimmedUsername,
        github_url: sanitizeExternalUrl(githubUrl),
        linkedin_url: sanitizeExternalUrl(linkedinUrl),
        study_program: studyProgram || null,
        study_year: studyYear ? Number(studyYear) : null,
        accent_color: accentColor,
      })
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

  async function handleDeleteAccount() {
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("delete_own_account");

    if (error) {
      setDeleting(false);
      setErrorMessage(error.message);
      return;
    }

    await supabase.auth.signOut();
    router.push("/");
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
          <label className="mb-1.5 block text-sm font-medium">Farge</label>
          <div className="flex flex-wrap items-center gap-2">
            <div
              style={avatarStyle(accentColor)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold"
            >
              {(fullName || username || "?").charAt(0).toUpperCase()}
            </div>
            <div className="h-6 w-px bg-card-border" />
            {ACCENT_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setAccentColor(color.value)}
                title={color.name}
                aria-label={color.name}
                style={{ backgroundColor: color.value }}
                className={`h-7 w-7 rounded-full transition ${
                  accentColor === color.value
                    ? "ring-2 ring-foreground ring-offset-2 ring-offset-card"
                    : "hover:scale-110"
                }`}
              />
            ))}
          </div>
        </div>

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

        <div>
          <label htmlFor="studyProgram" className="mb-1.5 block text-sm font-medium">
            Linje
          </label>
          <select
            id="studyProgram"
            value={studyProgram}
            onChange={(e) => setStudyProgram(e.target.value)}
            className="w-full rounded-xl border border-card-border bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
          >
            <option value="">Ikke valgt</option>
            {STUDY_PROGRAMS.map((program) => (
              <option key={program} value={program}>
                {program}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="studyYear" className="mb-1.5 block text-sm font-medium">
            År
          </label>
          <select
            id="studyYear"
            value={studyYear}
            onChange={(e) => setStudyYear(e.target.value)}
            className="w-full rounded-xl border border-card-border bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
          >
            <option value="">Ikke valgt</option>
            {STUDY_YEARS.map((year) => (
              <option key={year} value={year}>
                {year}. år
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="githubUrl" className="mb-1.5 block text-sm font-medium">
            GitHub-lenke
          </label>
          <input
            id="githubUrl"
            type="text"
            placeholder="github.com/brukernavn"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="w-full rounded-xl border border-card-border bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
          />
        </div>

        <div>
          <label htmlFor="linkedinUrl" className="mb-1.5 block text-sm font-medium">
            LinkedIn-lenke
          </label>
          <input
            id="linkedinUrl"
            type="text"
            placeholder="linkedin.com/in/brukernavn"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            className="w-full rounded-xl border border-card-border bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
          />
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

      <div className="mt-10 rounded-xl border border-red-500/30 p-4">
        <h2 className="text-sm font-semibold text-red-500">Slett bruker</h2>
        <p className="mt-1 text-xs text-muted">
          Dette sletter kontoen din for godt, inkludert profil, følgere og
          forespørsler. Kan ikke angres.
        </p>

        {confirmingDelete ? (
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-600 disabled:opacity-60"
            >
              {deleting ? "Sletter…" : "Ja, slett kontoen min"}
            </button>
            <button
              onClick={() => setConfirmingDelete(false)}
              disabled={deleting}
              className="rounded-lg border border-card-border px-3 py-1.5 text-xs font-medium transition hover:bg-accent-soft"
            >
              Avbryt
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="mt-3 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-500/10"
          >
            Slett bruker
          </button>
        )}
      </div>
    </div>
  );
}
