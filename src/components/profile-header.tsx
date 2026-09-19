import type { ReactNode } from "react";
import Avatar from "@/components/avatar";
import ProfileLinks from "@/components/profile-links";
import CourseChips from "@/components/course-chips";
import { Card } from "@/components/form-ui";
import type { Course } from "@/lib/courses";
import { programLabel } from "@/lib/i18n";
import { getT } from "@/lib/i18n/server";
import type { Profile } from "@/lib/profiles";

// The top card of a profile page. Shared by your own profile and other
// people's, so the two always look the same.
export default async function ProfileHeader({
  profile,
  bio,
  courses,
  counts,
  showIfiUsername,
  actions,
}: {
  profile: Profile;
  bio: string | null;
  courses: Course[];
  counts: { followers: number; following: number };
  showIfiUsername?: boolean;
  actions?: ReactNode;
}) {
  const { t, lang } = await getT();
  const hasLinks = Boolean(profile.github_url || profile.linkedin_url);

  return (
    <Card>
      <div className="flex items-center gap-4">
        <Avatar profile={profile} className="h-16 w-16 text-2xl" />
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold leading-tight">
            {profile.full_name}
          </h1>
          <p className="truncate text-sm text-muted">@{profile.username}</p>
          {showIfiUsername && (
            <p className="truncate text-xs text-muted">
              {t("profile.ifi", { name: profile.ifi_username })}
            </p>
          )}
        </div>
      </div>

      {profile.study_program && (
        <p className="text-xs text-muted">
          {programLabel(lang, profile.study_program)}
          {profile.study_year ? ` · ${t("profile.year", { n: profile.study_year })}` : ""}
        </p>
      )}

      {bio && <p className="whitespace-pre-line break-words text-sm">{bio}</p>}

      {(hasLinks || courses.length > 0) && (
        <div className="space-y-3">
          <ProfileLinks githubUrl={profile.github_url} linkedinUrl={profile.linkedin_url} />
          <CourseChips courses={courses} />
        </div>
      )}

      <div className="grid grid-cols-2 divide-x divide-card-border rounded-xl bg-accent-soft/60 py-2.5 text-center">
        <div>
          <p className="text-lg font-semibold leading-tight">{counts.followers}</p>
          <p className="text-xs text-muted">{t("profile.followers")}</p>
        </div>
        <div>
          <p className="text-lg font-semibold leading-tight">{counts.following}</p>
          <p className="text-xs text-muted">{t("profile.following")}</p>
        </div>
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </Card>
  );
}
