"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  ACCENT_COLORS,
  STUDY_PROGRAMS,
  handleFromUrl,
  linkUrl,
  looksLikeLink,
  parseLinkHandle,
} from "@/lib/profiles";
import { getUserCourses, type Course } from "@/lib/courses";
import { getUserAssociations, type UserAssociation } from "@/lib/associations";
import StudyProgramSelect from "@/components/study-program-select";
import CourseMultiSelect from "@/components/course-multi-select";
import AssociationMultiSelect from "@/components/association-multi-select";
import AppearanceSettings from "@/components/appearance-settings";
import ChangePasswordCard from "@/components/change-password-card";
import ProfileVisibility from "@/components/profile-visibility";
import YearPicker from "@/components/year-picker";
import LinkHandleInput from "@/components/link-handle-input";
import AvatarPicker from "@/components/avatar-picker";
import { Card, Field, SectionTitle, StickyBar, inputClass } from "@/components/form-ui";
import { BugIcon, ChevronRightIcon } from "@/components/meta-icons";
import Collapsible from "@/components/collapsible";
import { AVATAR_BUCKET, uploadedAvatarPath } from "@/lib/avatars";
import { downloadMyData } from "@/lib/export-data";
import { useI18n } from "@/lib/i18n/client";
import { cleanLine, cleanText } from "@/lib/sanitize";

const BIO_MAX = 160;


type Fields = {
  bio: string;
  fullName: string;
  githubHandle: string;
  linkedinHandle: string;
  studyProgram: string;
  studyYear: string;
  courseCodes: string[];
  associations: UserAssociation[];
};

// Stable order, so the dirty-check doesn't fire just because items were
// added in a different order than they were saved in.
function sortAssociations(list: UserAssociation[]): UserAssociation[] {
  return [...list].sort((a, b) => a.association.localeCompare(b.association));
}

export default function SettingsPage() {
  const router = useRouter();
  const { t } = useI18n();

  const [userId, setUserId] = useState("");
  const [ifiUsername, setIfiUsername] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(true);
  const [accentColor, setAccentColor] = useState<string>(ACCENT_COLORS[0].value);

  const [bio, setBio] = useState("");
  const [fullName, setFullName] = useState("");
  const [githubHandle, setGithubHandle] = useState("");
  const [linkedinHandle, setLinkedinHandle] = useState("");
  const [studyProgram, setStudyProgram] = useState("");
  const [studyYear, setStudyYear] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [savedCourses, setSavedCourses] = useState<Course[]>([]);
  const [associations, setAssociations] = useState<UserAssociation[]>([]);
  const [savedAssociations, setSavedAssociations] = useState<UserAssociation[]>([]);

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
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("visible_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const userCourses = await getUserCourses(supabase, user.id);
      const userAssociations = await getUserAssociations(supabase, user.id);
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
        setIfiUsername(profile.ifi_username ?? "");
        setIsPrivate(profile.is_private ?? true);
        setFullName(profile.full_name);
        setGithubHandle(handleFromUrl("github", profile.github_url));
        setLinkedinHandle(handleFromUrl("linkedin", profile.linkedin_url));
        setStudyProgram(profile.study_program ?? "");
        setStudyYear(profile.study_year ? String(profile.study_year) : "");
      }
      setCourses(userCourses);
      setSavedCourses(userCourses);
      setAssociations(userAssociations);
      setSavedAssociations(userAssociations);
      setBio(savedBio);
      setSaved({
        bio: savedBio,
        fullName: profile?.full_name ?? "",
        githubHandle: handleFromUrl("github", profile?.github_url),
        linkedinHandle: handleFromUrl("linkedin", profile?.linkedin_url),
        studyProgram: profile?.study_program ?? "",
        studyYear: profile?.study_year ? String(profile.study_year) : "",
        courseCodes: userCourses.map((c) => c.code),
        associations: sortAssociations(userAssociations),
      });
      setLoading(false);
    })();
  }, []);

  const current: Fields = {
    bio,
    fullName,
    githubHandle,
    linkedinHandle,
    studyProgram,
    studyYear,
    courseCodes: courses.map((c) => c.code),
    associations: sortAssociations(associations),
  };
  const dirty = saved !== null && JSON.stringify(current) !== JSON.stringify(saved);

  // Closing the tab or reloading with unsaved changes asks first.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

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

    const trimmedName = cleanLine(fullName);

    if (!trimmedName) {
      setErrorMessage(t("settings.nameRequired"));
      return;
    }
    // Only a username is accepted, never a link.
    const github = parseLinkHandle("github", githubHandle);
    const linkedin = parseLinkHandle("linkedin", linkedinHandle);
    if (github === null) {
      setErrorMessage(
        looksLikeLink(githubHandle) ? t("settings.noLinks") : t("settings.invalidGithub")
      );
      return;
    }
    if (linkedin === null) {
      setErrorMessage(
        looksLikeLink(linkedinHandle) ? t("settings.noLinks") : t("settings.invalidLinkedin")
      );
      return;
    }
    const cleanedAssociations = associations.map((a) => ({ ...a, title: cleanLine(a.title) }));
    if (cleanedAssociations.some((a) => !a.title)) {
      setErrorMessage(t("settings.associationTitleRequired"));
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: trimmedName,
        github_url: github ? linkUrl("github", github) : null,
        linkedin_url: linkedin ? linkUrl("linkedin", linkedin) : null,
        study_program: studyProgram || null,
        study_year: studyYear ? Number(studyYear) : null,
      })
      .eq("id", userId);

    if (error) {
      setSaving(false);
      setErrorMessage(t("common.somethingWrong"));
      return;
    }

    await supabase.auth.updateUser({
      data: { full_name: trimmedName },
    });

    const trimmedBio = cleanText(bio);
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
        setErrorMessage(t("common.somethingWrong"));
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
        setErrorMessage(t("common.somethingWrong"));
        return;
      }
    }
    if (added.length > 0) {
      const { error: addError } = await supabase
        .from("user_courses")
        .insert(added.map((code) => ({ user_id: userId, course_code: code })));
      if (addError) {
        setSaving(false);
        setErrorMessage(t("common.somethingWrong"));
        return;
      }
    }

    // Same idea for associations: only touch what actually changed.
    const savedBySlug = new Map(savedAssociations.map((a) => [a.association, a.title]));
    const currentSlugs = new Set(cleanedAssociations.map((a) => a.association));
    const removedAssoc = savedAssociations
      .filter((a) => !currentSlugs.has(a.association))
      .map((a) => a.association);
    const addedAssoc = cleanedAssociations.filter((a) => !savedBySlug.has(a.association));
    const changedAssoc = cleanedAssociations.filter(
      (a) => savedBySlug.has(a.association) && savedBySlug.get(a.association) !== a.title
    );
    if (removedAssoc.length > 0) {
      const { error: removeAssocError } = await supabase
        .from("user_associations")
        .delete()
        .eq("user_id", userId)
        .in("association", removedAssoc);
      if (removeAssocError) {
        setSaving(false);
        setErrorMessage(t("common.somethingWrong"));
        return;
      }
    }
    if (addedAssoc.length > 0) {
      const { error: addAssocError } = await supabase
        .from("user_associations")
        .insert(addedAssoc.map((a) => ({ user_id: userId, association: a.association, title: a.title })));
      if (addAssocError) {
        setSaving(false);
        setErrorMessage(t("common.somethingWrong"));
        return;
      }
    }
    for (const a of changedAssoc) {
      const { error: updateAssocError } = await supabase
        .from("user_associations")
        .update({ title: a.title })
        .eq("user_id", userId)
        .eq("association", a.association);
      if (updateAssocError) {
        setSaving(false);
        setErrorMessage(t("common.somethingWrong"));
        return;
      }
    }

    setSaved({
      ...current,
      bio: trimmedBio,
      fullName: trimmedName,
      githubHandle: github,
      linkedinHandle: linkedin,
      associations: sortAssociations(cleanedAssociations),
    });
    setSavedCourses(courses);
    setSavedAssociations(cleanedAssociations);
    setAssociations(cleanedAssociations);
    setBio(trimmedBio);
    setFullName(trimmedName);
    setGithubHandle(github);
    setLinkedinHandle(linkedin);
    setSaving(false);
    setJustSaved(true);
    router.refresh();
  }

  // Put every field back to what is saved.
  function discardChanges() {
    if (!saved) return;
    setBio(saved.bio);
    setFullName(saved.fullName);
    setGithubHandle(saved.githubHandle);
    setLinkedinHandle(saved.linkedinHandle);
    setStudyProgram(saved.studyProgram);
    setStudyYear(saved.studyYear);
    setCourses(savedCourses);
    setAssociations(savedAssociations);
    setErrorMessage("");
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
      setDeleteError(t("common.somethingWrong"));
      return;
    }

    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div
        className="mx-auto w-full max-w-md px-6 pt-5 md:max-w-xl md:pt-7"
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

  // The save bar only shows while there is something to save (and for a moment after).
  const showBar = dirty || saving || justSaved;
  const rise = (i: number) => ({ ["--i" as string]: i });

  return (
    <div className="mx-auto w-full max-w-md px-6 pb-8 pt-5 md:max-w-xl md:pt-7 lg:max-w-5xl">
      <Link
        href="/profile"
        className="inline-block text-sm font-medium text-muted transition hover:text-foreground"
      >
        {t("profile.backToProfile")}
      </Link>

      <h1 className="mb-5 mt-3 text-xl font-semibold">{t("settings.title")}</h1>

      <div className="space-y-6 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-8 lg:space-y-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          <section style={rise(0)} className="animate-rise">
            <SectionTitle>{t("settings.secProfile")}</SectionTitle>
            <div className="space-y-4">
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
                    maxLength={100}
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
                  <p
                    className={`mt-1 text-right text-xs transition-colors ${
                      bio.length >= BIO_MAX - 10 ? "text-accent" : "text-muted"
                    }`}
                  >
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
            </div>
          </section>

          <section style={rise(1)} className="animate-rise">
            <SectionTitle>{t("settings.secVisibility")}</SectionTitle>
            <ProfileVisibility userId={userId} initialPrivate={isPrivate} />
          </section>

          {/* z-30: the program and course lists open downward and must sit above the cards below. */}
          <section style={rise(2)} className="animate-rise relative z-30">
            <SectionTitle>{t("settings.secStudy")}</SectionTitle>
            <Card>
              <Field label={t("settings.program")}>
                <StudyProgramSelect
                  value={studyProgram}
                  onChange={edit(setStudyProgram)}
                  options={STUDY_PROGRAMS}
                />
              </Field>

              <Field label={t("settings.year")}>
                <YearPicker value={studyYear} onChange={edit(setStudyYear)} />
              </Field>

              <Field label={t("settings.courses")} hint={t("settings.coursesHint")}>
                <CourseMultiSelect selected={courses} onChange={edit(setCourses)} />
              </Field>
            </Card>
          </section>

          <section style={rise(2)} className="animate-rise">
            <SectionTitle>{t("settings.secLinks")}</SectionTitle>
            <Card>
              <Field label={t("settings.github")} hint={t("settings.linkHint")}>
                <LinkHandleInput
                  id="githubHandle"
                  prefix="github.com/"
                  placeholder={t("settings.githubPlaceholder")}
                  value={githubHandle}
                  onChange={edit(setGithubHandle)}
                />
              </Field>

              <Field label={t("settings.linkedin")}>
                <LinkHandleInput
                  id="linkedinHandle"
                  prefix="linkedin.com/in/"
                  placeholder={t("settings.linkedinPlaceholder")}
                  value={linkedinHandle}
                  onChange={edit(setLinkedinHandle)}
                />
              </Field>
            </Card>
          </section>

          {/* z-30: same reason as the study section above — the picker opens
              downward and must sit above the sticky save bar. */}
          <section style={rise(3)} className="animate-rise relative z-30">
            <SectionTitle>{t("settings.secAssociations")}</SectionTitle>
            <Card>
              <Field label={t("settings.associations")} hint={t("settings.associationsHint")}>
                <AssociationMultiSelect selected={associations} onChange={edit(setAssociations)} />
              </Field>
            </Card>
          </section>

          {errorMessage && (
            <p role="alert" className="animate-pop text-sm text-red-500">
              {errorMessage}
            </p>
          )}

          {showBar && (
            <>
              <StickyBar className="animate-sheet-up lg:mx-0 lg:rounded-2xl lg:border lg:px-4">
                <div className="flex items-center gap-3">
                  <p
                    aria-live="polite"
                    className={`min-w-0 flex-1 truncate text-xs ${
                      dirty ? "text-muted" : "text-accent"
                    }`}
                  >
                    {dirty ? t("settings.unsaved") : justSaved ? `✓ ${t("common.saved")}` : ""}
                  </p>
                  {dirty && !saving && (
                    <button
                      type="button"
                      onClick={discardChanges}
                      className="h-11 shrink-0 rounded-xl border border-card-border px-4 text-sm font-medium transition hover:bg-accent-soft active:scale-[0.98]"
                    >
                      {t("settings.discard")}
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={saving || !dirty}
                    className="h-11 shrink-0 rounded-xl bg-accent px-6 text-sm font-medium text-white transition hover:bg-accent-hover active:scale-[0.98] disabled:opacity-50"
                  >
                    {saving ? t("common.saving") : t("common.save")}
                  </button>
                </div>
              </StickyBar>
            </>
          )}
        </form>

        <aside className="space-y-6">
          <section style={rise(3)} className="animate-rise">
            <SectionTitle>{t("settings.secAppearance")}</SectionTitle>
            <AppearanceSettings />
          </section>

          <section style={rise(4)} className="animate-rise">
            <SectionTitle>{t("settings.secSecurity")}</SectionTitle>
            <ChangePasswordCard />
          </section>

          <section style={rise(5)} className="animate-rise">
            <SectionTitle>{t("settings.secData")}</SectionTitle>
            <div className="divide-y divide-card-border overflow-hidden rounded-2xl border border-card-border bg-card">
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-accent-soft/60 active:bg-accent-soft disabled:opacity-60"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium">
                    {exporting ? t("settings.exporting") : t("settings.export")}
                  </span>
                  <span className="block text-xs text-muted">{t("settings.exportHint")}</span>
                </span>
                <ChevronRightIcon className="h-4 w-4 shrink-0 text-muted" />
              </button>
              {(
                [
                  ["/personvern", t("settings.privacy")],
                  ["/vilkar", t("terms.link")],
                  ["/informasjonskapsler", t("cookies.link")],
                  ["/tilgjengelighet", t("a11y.link")],
                ] as const
              ).map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium transition hover:bg-accent-soft/60 active:bg-accent-soft"
                >
                  {label}
                  <ChevronRightIcon className="h-4 w-4 shrink-0 text-muted" />
                </Link>
              ))}
              <Link
                href="/rapporter-feil"
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium transition hover:bg-accent-soft/60 active:bg-accent-soft"
              >
                <span className="flex items-center gap-2">
                  <BugIcon className="h-4 w-4 shrink-0 text-muted" />
                  {t("bug.link")}
                </span>
                <ChevronRightIcon className="h-4 w-4 shrink-0 text-muted" />
              </Link>
            </div>
            {exportError && (
              <p role="alert" className="mt-2 text-xs text-red-500">
                {t("settings.exportError")}
              </p>
            )}
          </section>

          <section style={rise(6)} className="animate-rise">
            <div className="rounded-2xl border border-red-500/30 bg-card p-4">
              <h2 className="text-sm font-semibold text-red-500">{t("settings.deleteTitle")}</h2>
              <p className="mt-1 text-xs text-muted">{t("settings.deleteText")}</p>
              {deleteError && (
                <p role="alert" className="mt-2 text-xs text-red-500">
                  {deleteError}
                </p>
              )}

              <Collapsible open={confirmingDelete}>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="h-9 rounded-xl bg-red-500 text-xs font-medium text-white transition hover:bg-red-600 active:scale-[0.98] disabled:opacity-60"
                  >
                    {deleting ? t("common.deleting") : t("settings.deleteConfirm")}
                  </button>
                  <button
                    onClick={() => setConfirmingDelete(false)}
                    disabled={deleting}
                    className="h-9 rounded-xl border border-card-border text-xs font-medium transition hover:bg-accent-soft active:scale-[0.98]"
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              </Collapsible>

              {!confirmingDelete && (
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="mt-3 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-500/10 active:scale-95"
                >
                  {t("settings.deleteTitle")}
                </button>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
