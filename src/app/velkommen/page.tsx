import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/get-user";
import { getProfileById } from "@/lib/profiles";
import { getUserCourses } from "@/lib/courses";
import { getUserAssociations } from "@/lib/associations";
import OnboardingForm from "@/components/onboarding-form";
import LanguageSwitch from "@/components/language-switch";
import Logo from "@/components/logo";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "Velkommen · Kollokvie@IFI" };

// Shown to a signed-in user exactly once, right after their account is
// created (see (app)/layout.tsx, which redirects here while
// profile.onboarded_at is null). Not a gate: everything on it is optional.
export default async function WelcomePage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const profile = await getProfileById(supabase, user.id);
  if (!profile) redirect("/dashboard");
  if ("onboarded_at" in profile && profile.onboarded_at) redirect("/dashboard");

  const [courses, associations] = await Promise.all([
    getUserCourses(supabase, user.id),
    getUserAssociations(supabase, user.id),
  ]);

  const { t } = await getT();

  return (
    <main id="main-content" className="relative mx-auto w-full max-w-md px-6 pb-12 pt-16 md:max-w-xl">
      <LanguageSwitch />

      <div className="mb-6 text-center">
        <Logo className="mb-4 inline-block h-14 w-14" />
        <h1 className="text-xl font-semibold tracking-tight">{t("onboarding.title")}</h1>
        <p className="mt-2 text-sm text-muted">{t("onboarding.intro")}</p>
      </div>

      <OnboardingForm
        profile={{
          id: user.id,
          full_name: profile.full_name,
          username: profile.username,
          accent_color: profile.accent_color,
        }}
        initialAvatar={profile.avatar}
        initialStudyProgram={profile.study_program ?? ""}
        initialStudyYear={profile.study_year ? String(profile.study_year) : ""}
        initialCourses={courses}
        initialAssociations={associations}
      />
    </main>
  );
}
