"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  ACCENT_COLORS,
  STUDY_PROGRAMS,
  sanitizeExternalUrl,
} from "@/lib/profiles";
import { getUserCourses, type Course } from "@/lib/courses";
import StudyProgramSelect from "@/components/study-program-select";
import CourseMultiSelect from "@/components/course-multi-select";
import AppearanceSettings from "@/components/appearance-settings";
import AvatarPicker from "@/components/avatar-picker";
import { Card, Field, StickyBar, inputClass } from "@/components/form-ui";
import { AVATAR_BUCKET, uploadedAvatarPath } from "@/lib/avatars";
import { downloadMyData } from "@/lib/export-data";
import { useI18n } from "@/lib/i18n/client";

const BIO_MAX = 160;

const STUDY_YEARS = [1, 2, 3, 4, 5];

type Fields = {
  bio: string;
  fullName: string;
  githubUrl: string;
  linkedinUrl: string;
  studyProgram: string;
  studyYear: string;
  courseCodes: string[];
};

export default function SettingsPage() {
  const router = useRouter();
  const { t } = useI18n();

  const [userId, setUserId] = useState("");
  const [ifiUsername, setIfiUsername] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [accentColor, setAccentColor] = useState<string>(ACCENT_COLORS[0].value);

  const [bio, setBio] = useState("");
  const [fullName, setFullName] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [studyProgram, setStudyProgram] = useState("");
  const [studyYear, setStudyYear] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);

  // What's saved in the database, so Save is only active when something changed.
  const [saved, setSaved] = useState<Fields | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(false);

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

      const userCourses = await getUserCourses(supabase, user.id);
      const { data: bioRow } = await supabase
        .from("profile_bios")
        .select("bio")
        .eq("user_id", user.id)
        .maybeSingle();
      const savedBio = bioRow?.bio ?? "";

      setUserId(user.id);
      if (profile) {
        setAvatar(profile.avatar ?? null);
        setAccentColor(profile.accent_color ?? ACCENT_COLORS[0].value);
        setIfiUsername(profile.ifi_username);
        setFullName(profile.full_name);
        setGithubUrl(profile.github_url ?? "");
        setLinkedinUrl(profile.linkedin_url ?? "");
        setStudyProgram(profile.study_program ?? "");
        setStudyYear(profile.study_year ? String(profile.study_year) : "");
      }
      setCourses(userCourses);
      setBio(savedBio);
      setSaved({
        bio: savedBio,
        fullName: profile?.full_name ?? "",
        githubUrl: profile?.github_url ?? "",
        linkedinUrl: profile?.linkedin_url ?? "",
        studyProgram: profile?.study_program ?? "",
        studyYear: profile?.study_year ? String(profile.study_year) : "",
        courseCodes: userCourses.map((c) => c.code),
      });
      setLoading(false);
    })();
  }, []);

  const current: Fields = {
    bio,
    fullName,
    githubUrl,
    linkedinUrl,
    studyProgram,
    studyYear,
    courseCodes: courses.map((c) => c.code),
  };
  const dirty = saved !== null && JSON.stringify(current) !== JSON.stringify(saved);

  // Any edit clears the "Saved" note.
  function edit<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setJustSaved(false);
    };
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!dirty || !saved) return;
    setJustSaved(false);
    setErrorMessage("");

    const trimmedName = fullName.trim();

    if (!trimmedName) {
      setErrorMessage(t("settings.nameRequired"));
      return;
    }
    const github = githubUrl.trim() ? sanitizeExternalUrl(githubUrl) : null;
    const linkedin = linkedinUrl.trim() ? sanitizeExternalUrl(linkedinUrl) : null;
    if (githubUrl.trim() && !github) {
      setErrorMessage(t("settings.invalidLink", { field: "GitHub" }));
      return;
    }
    if (linkedinUrl.trim() && !linkedin) {
      setErrorMessage(t("settings.invalidLink", { field: "LinkedIn" }));
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: trimmedName,
        github_url: github,
        linkedin_url: linkedin,
        study_program: studyProgram || null,
        study_year: studyYear ? Number(studyYear) : null,
      })
      .eq("id", userId);

    if (error) {
      setSaving(false);
      setErrorMessage(
        error.message.includes("duplicate") ? t("settings.usernameTaken") : error.message
      );
      return;
    }

    await supabase.auth.updateUser({
      data: { full_name: trimmedName },
    });

    const trimmedBio = bio.trim();
    if (trimmedBio !== saved.bio.trim()) {
      const { error: bioError } = trimmedBio
        ? await supabase
            .from("profile_bios")
            .upsert(
              { user_id: userId, bio: trimmedBio, updated_at: new Date().toISOString() },
              { onConflict: "user_id" }
            )
        : await supabase.from("profile_bios").delete().eq("user_id", userId);
      if (bioError) {
        setSaving(false);
        setErrorMessage(bioError.message);
        return;
      }
    }

    // Only touch what changed, so a failed insert can't wipe the whole list.
    const currentCodes = current.courseCodes;
    const removed = saved.courseCodes.filter((code) => !currentCodes.includes(code));
    const added = currentCodes.filter((code) => !saved.courseCodes.includes(code));
    if (removed.length > 0) {
      const { error: removeError } = await supabase
        .from("user_courses")
        .delete()
        .eq("user_id", userId)
        .in("course_code", removed);
      if (removeError) {
        setSaving(false);
        setErrorMessage(removeError.message);
        return;
      }
    }
    if (added.length > 0) {
      const { error: addError } = await supabase
        .from("user_courses")
        .insert(added.map((code) => ({ user_id: userId, course_code: code })));
      if (addError) {
        setSaving(false);
        setErrorMessage(addError.message);
        return;
      }
    }

    setSaved({
      ...current,
      bio: trimmedBio,
      fullName: trimmedName,
      githubUrl: github ?? "",
      linkedinUrl: linkedin ?? "",
    });
    setBio(trimmedBio);
    setFullName(trimmedName);
    setGithubUrl(github ?? "");
    setLinkedinUrl(linkedin ?? "");
    setSaving(false);
    setJustSaved(true);
    router.refresh();
  }

  async function handleExport() {
    setExporting(true);
    setExportError(false);
    try {
      await downloadMyData();
    } catch {
      setExportError(true);
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    setDeleteError("");
    const supabase = createClient();
    // Best effort: don't leave an uploaded picture behind.
    if (userId) {
      await supabase.storage.from(AVATAR_BUCKET).remove([uploadedAvatarPath(userId)]);
    }
    const { error } = await supabase.rpc("delete_own_account");

    if (error) {
      setDeleting(false);
      setDeleteError(error.message);
      return;
    }

    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div
        className="mx-auto w-full max-w-md px-6 pt-5"
        role="status"
        aria-label={t("common.loadingAria")}
      >
        <div className="h-5 w-32 animate-pulse rounded-lg bg-accent-soft" />
        <div className="mb-5 mt-4 h-7 w-40 animate-pulse rounded-lg bg-accent-soft" />
        <div className="space-y-4">
          {[176, 208, 256, 152].map((h) => (
            <div
              key={h}
              style={{ height: h }}
              className="animate-pulse rounded-2xl border border-card-border bg-accent-soft/40"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md px-6 pt-5">
      <Link
        href="/profile"
        className="text-sm font-medium text-muted transition hover:text-foreground"
      >
        {t("profile.backToProfile")}
      </Link>

      <h1 className="mb-5 mt-3 text-xl font-semibold">{t("settings.title")}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <AvatarPicker
            profile={{
              id: userId,
              full_name: fullName,
              username: ifiUsername,
              accent_color: accentColor,
            }}
            value={avatar}
            onChange={setAvatar}
            onColorChange={setAccentColor}
          />
        </Card>

        <Card>
          <Field label={t("auth.fullName")} htmlFor="fullName">
            <input
              id="fullName"
              type="text"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => edit(setFullName)(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label={t("settings.bio")} htmlFor="bio" hint={t("settings.bioHint")}>
            <textarea
              id="bio"
              rows={3}
              maxLength={BIO_MAX}
              placeholder={t("settings.bioPlaceholder")}
              value={bio}
              onChange={(e) => edit(setBio)(e.target.value)}
              className="block w-full min-w-0 resize-none rounded-xl border border-card-border bg-transparent px-3.5 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
            />
            <p className="mt-1 text-right text-xs text-muted">
              {bio.length}/{BIO_MAX}
            </p>
          </Field>

          <Field
            label={t("auth.ifiUsername")}
            htmlFor="ifiUsername"
            hint={t("settings.ifiLocked")}
          >
            <input
              id="ifiUsername"
              type="text"
              disabled
              value={ifiUsername}
              className={`${inputClass} cursor-not-allowed text-muted opacity-70`}
            />
          </Field>
        </Card>

        <Card>
          <Field label={t("settings.program")}>
            <StudyProgramSelect
              value={studyProgram}
              onChange={edit(setStudyProgram)}
              options={STUDY_PROGRAMS}
            />
          </Field>

          <Field label={t("settings.year")} htmlFor="studyYear">
            <select
              id="studyYear"
              value={studyYear}
              onChange={(e) => edit(setStudyYear)(e.target.value)}
              className={inputClass}
            >
              <option value="">{t("common.notSelected")}</option>
              {STUDY_YEARS.map((year) => (
                <option key={year} value={year}>
                  {t("profile.year", { n: year })}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t("settings.courses")} hint={t("settings.coursesHint")}>
            <CourseMultiSelect selected={courses} onChange={edit(setCourses)} />
          </Field>
        </Card>

        <Card>
          <Field label={t("settings.github")} htmlFor="githubUrl">
            <input
              id="githubUrl"
              type="text"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              placeholder="github.com/brukernavn"
              value={githubUrl}
              onChange={(e) => edit(setGithubUrl)(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label={t("settings.linkedin")} htmlFor="linkedinUrl">
            <input
              id="linkedinUrl"
              type="text"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              placeholder="linkedin.com/in/brukernavn"
              value={linkedinUrl}
              onChange={(e) => edit(setLinkedinUrl)(e.target.value)}
              className={inputClass}
            />
          </Field>
        </Card>

        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

        <StickyBar>
          <button
            type="submit"
            disabled={saving || !dirty}
            className="h-11 w-full rounded-xl bg-accent px-4 text-sm font-medium text-white transition hover:bg-accent-hover active:scale-[0.99] disabled:opacity-50"
          >
            {saving
              ? t("common.saving")
              : justSaved && !dirty
                ? `✓ ${t("common.saved")}`
                : t("common.save")}
          </button>
        </StickyBar>
      </form>

      <AppearanceSettings />

      <section className="mt-4 space-y-2.5 border-t border-card-border pt-4">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/personvern"
            className="text-xs text-muted transition hover:text-foreground"
          >
            {t("settings.privacy")}
          </Link>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="rounded-lg border border-card-border px-2.5 py-1 text-xs font-medium transition hover:bg-accent-soft active:scale-95 disabled:opacity-60"
          >
            {exporting ? t("settings.exporting") : t("settings.export")}
          </button>
        </div>
        {exportError && <p className="text-xs text-red-500">{t("settings.exportError")}</p>}
      </section>

      <div className="mb-6 mt-6 rounded-xl border border-red-500/30 p-4">
        <h2 className="text-sm font-semibold text-red-500">{t("settings.deleteTitle")}</h2>
        <p className="mt-1 text-xs text-muted">{t("settings.deleteText")}</p>
        {deleteError && <p className="mt-2 text-xs text-red-500">{deleteError}</p>}

        {confirmingDelete ? (
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-600 disabled:opacity-60"
            >
              {deleting ? t("common.deleting") : t("settings.deleteConfirm")}
            </button>
            <button
              onClick={() => setConfirmingDelete(false)}
              disabled={deleting}
              className="rounded-lg border border-card-border px-3 py-1.5 text-xs font-medium transition hover:bg-accent-soft"
            >
              {t("common.cancel")}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="mt-3 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-500/10"
          >
            {t("settings.deleteTitle")}
          </button>
        )}
      </div>
    </div>
  );
}
