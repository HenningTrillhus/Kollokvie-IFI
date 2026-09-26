"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { STUDY_PROGRAMS } from "@/lib/profiles";
import { getUserAssociations, type UserAssociation } from "@/lib/associations";
import { getUserCourses, type Course } from "@/lib/courses";
import StudyProgramSelect from "@/components/study-program-select";
import YearPicker from "@/components/year-picker";
import CourseMultiSelect from "@/components/course-multi-select";
import AssociationMultiSelect from "@/components/association-multi-select";
import AvatarPicker from "@/components/avatar-picker";
import { Card, Field, SectionTitle, StickyBar } from "@/components/form-ui";
import { CloseIcon } from "@/components/meta-icons";
import { useI18n } from "@/lib/i18n/client";
import { cleanLine } from "@/lib/sanitize";

// Nothing here is required — Lagre stores whatever was filled in, and the X
// skips all of it. Either way, this page never shows again (see the
// onboarded_at update at the end of both paths).
export default function OnboardingForm({
  profile,
  initialAvatar,
  initialStudyProgram,
  initialStudyYear,
  initialCourses,
  initialAssociations,
}: {
  profile: { id: string; full_name: string; username: string | null; accent_color: string };
  initialAvatar: string | null;
  initialStudyProgram: string;
  initialStudyYear: string;
  initialCourses: Course[];
  initialAssociations: UserAssociation[];
}) {
  const router = useRouter();
  const { t } = useI18n();

  const [avatar, setAvatar] = useState(initialAvatar);
  const [accentColor, setAccentColor] = useState(profile.accent_color);
  const [studyProgram, setStudyProgram] = useState(initialStudyProgram);
  const [studyYear, setStudyYear] = useState(initialStudyYear);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [associations, setAssociations] = useState<UserAssociation[]>(initialAssociations);
  const [saving, setSaving] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function markOnboarded(supabase: ReturnType<typeof createClient>) {
    await supabase
      .from("profiles")
      .update({ onboarded_at: new Date().toISOString() })
      .eq("id", profile.id);
  }

  async function handleSkip() {
    setSkipping(true);
    const supabase = createClient();
    await markOnboarded(supabase);
    router.push("/dashboard");
    router.refresh();
  }

  async function handleSave() {
    setSaving(true);
    setErrorMessage("");
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        study_program: studyProgram || null,
        study_year: studyYear ? Number(studyYear) : null,
      })
      .eq("id", profile.id);
    if (error) {
      setSaving(false);
      setErrorMessage(t("onboarding.error"));
      return;
    }

    // Starting from empty, so there's nothing to remove: just add what's picked.
    const savedCourses = await getUserCourses(supabase, profile.id);
    const savedCodes = new Set(savedCourses.map((c) => c.code));
    const newCourses = courses.filter((c) => !savedCodes.has(c.code));
    if (newCourses.length > 0) {
      const { error: coursesError } = await supabase
        .from("user_courses")
        .insert(newCourses.map((c) => ({ user_id: profile.id, course_code: c.code })));
      if (coursesError) {
        setSaving(false);
        setErrorMessage(t("onboarding.error"));
        return;
      }
    }

    const cleanedAssociations = associations.map((a) => ({ ...a, title: cleanLine(a.title) }));
    if (cleanedAssociations.some((a) => !a.title)) {
      setSaving(false);
      setErrorMessage(t("settings.associationTitleRequired"));
      return;
    }
    const savedAssociations = await getUserAssociations(supabase, profile.id);
    const savedSlugs = new Set(savedAssociations.map((a) => a.association));
    const newAssociations = cleanedAssociations.filter((a) => !savedSlugs.has(a.association));
    if (newAssociations.length > 0) {
      const { error: assocError } = await supabase.from("user_associations").insert(
        newAssociations.map((a) => ({
          user_id: profile.id,
          association: a.association,
          title: a.title,
        }))
      );
      if (assocError) {
        setSaving(false);
        setErrorMessage(t("onboarding.error"));
        return;
      }
    }

    await markOnboarded(supabase);
    router.push("/dashboard");
    router.refresh();
  }

  const busy = saving || skipping;

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={handleSkip}
        disabled={busy}
        aria-label={t("onboarding.skip")}
        className="absolute left-4 top-[calc(env(safe-area-inset-top,0px)+1rem)] z-10 rounded-full p-2 text-muted transition hover:bg-accent-soft hover:text-foreground active:scale-90 disabled:opacity-60"
      >
        <CloseIcon className="h-5 w-5" />
      </button>

      <section className="animate-rise" style={{ ["--i" as string]: 0 }}>
        <SectionTitle>{t("settings.secProfile")}</SectionTitle>
        <Card>
          <AvatarPicker
            profile={{ ...profile, accent_color: accentColor }}
            value={avatar}
            onChange={setAvatar}
            onColorChange={setAccentColor}
          />
        </Card>
      </section>

      <section className="relative z-30 animate-rise" style={{ ["--i" as string]: 1 }}>
        <SectionTitle>{t("settings.secStudy")}</SectionTitle>
        <Card>
          <Field label={t("settings.program")}>
            <StudyProgramSelect
              value={studyProgram}
              onChange={setStudyProgram}
              options={STUDY_PROGRAMS}
            />
          </Field>

          <Field label={t("settings.year")}>
            <YearPicker value={studyYear} onChange={setStudyYear} />
          </Field>

          <Field label={t("settings.courses")} hint={t("settings.coursesHint")}>
            <CourseMultiSelect selected={courses} onChange={setCourses} />
          </Field>
        </Card>
      </section>

      <section className="relative z-20 animate-rise" style={{ ["--i" as string]: 2 }}>
        <SectionTitle>{t("settings.secAssociations")}</SectionTitle>
        <Card>
          <Field label={t("settings.associations")} hint={t("settings.associationsHint")}>
            <AssociationMultiSelect selected={associations} onChange={setAssociations} />
          </Field>
        </Card>
      </section>

      {errorMessage && (
        <p role="alert" className="animate-pop text-sm text-red-500">
          {errorMessage}
        </p>
      )}

      <StickyBar className="lg:mx-0 lg:rounded-2xl lg:border lg:px-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={busy}
          className="h-11 w-full rounded-xl bg-accent text-sm font-medium text-white transition hover:bg-accent-hover active:scale-[0.98] disabled:opacity-60"
        >
          {saving ? t("onboarding.saving") : t("onboarding.continue")}
        </button>
      </StickyBar>
    </div>
  );
}
