import type { ReactNode } from "react";
import Avatar from "@/components/avatar";
import ProfileLinks from "@/components/profile-links";
import CourseChips from "@/components/course-chips";
import { Card } from "@/components/form-ui";
import { LockIcon } from "@/components/meta-icons";
import type { Course } from "@/lib/courses";
import { programLabel } from "@/lib/i18n";
import { getT } from "@/lib/i18n/server";
import type { Profile } from "@/lib/profiles";

// A small heading inside a card.
function Label({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[11px] font-semibold uppercase tracking-wide text-muted">{children}</h2>
  );
}

// A profile page's information, split into cards: who they are, follower
// numbers, bio, studies, courses and links. Shared by your own profile and
// other people's, so the two always look the same. Cards with nothing to show
// (or hidden by a private profile) are left out.
export default async function ProfileHeader({
  profile,
  bio,
  courses,
  counts,
  actions,
}: {
  profile: Profile;
  bio: string | null;
  courses: Course[];
  // Left out when the profile's details are hidden from the viewer.
  counts?: { followers: number; following: number };
  actions?: ReactNode;
}) {
  const { t, lang } = await getT();
  const hasLinks = Boolean(profile.github_url || profile.linkedin_url);
  const rise = (i: number) => ({ ["--i" as string]: i });

  return (
    <div className="space-y-3">
      <div style={rise(0)} className="animate-rise">
        <Card>
          <div className="flex items-center gap-4">
            <Avatar profile={profile} className="h-16 w-16 text-2xl" />
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold leading-tight">
                {profile.full_name}
              </h1>
              {profile.username && (
                <p className="truncate text-sm text-muted">@{profile.username}</p>
              )}
              {profile.details_hidden && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                  <LockIcon className="h-3 w-3" />
                  {t("profile.privateBadge")}
                </p>
              )}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </Card>
      </div>

      {counts && (
        <div style={rise(1)} className="animate-rise">
          <div className="grid grid-cols-2 divide-x divide-card-border overflow-hidden rounded-2xl border border-card-border bg-card py-3 text-center">
            <div>
              <p className="text-xl font-semibold leading-tight">{counts.followers}</p>
              <p className="text-xs text-muted">{t("profile.followers")}</p>
            </div>
            <div>
              <p className="text-xl font-semibold leading-tight">{counts.following}</p>
              <p className="text-xs text-muted">{t("profile.following")}</p>
            </div>
          </div>
        </div>
      )}

      {bio && (
        <div style={rise(2)} className="animate-rise">
          <Card className="space-y-2">
            <Label>{t("profile.bioHeading")}</Label>
            <p className="whitespace-pre-line break-words text-sm leading-relaxed">{bio}</p>
          </Card>
        </div>
      )}

      {profile.study_program && (
        <div style={rise(3)} className="animate-rise">
          <Card className="space-y-2">
            <Label>{t("profile.studiesHeading")}</Label>
            <p className="text-sm font-medium leading-snug">
              {programLabel(lang, profile.study_program)}
            </p>
            {profile.study_year ? (
              <p className="text-xs text-muted">{t("profile.year", { n: profile.study_year })}</p>
            ) : null}
          </Card>
        </div>
      )}

      {courses.length > 0 && (
        <div style={rise(4)} className="animate-rise">
          <Card className="space-y-2.5">
            <Label>{t("profile.coursesHeading")}</Label>
            <CourseChips courses={courses} />
          </Card>
        </div>
      )}

      {hasLinks && (
        <div style={rise(5)} className="animate-rise">
          <Card className="space-y-2.5">
            <Label>{t("profile.linksHeading")}</Label>
            <ProfileLinks githubUrl={profile.github_url} linkedinUrl={profile.linkedin_url} />
          </Card>
        </div>
      )}
    </div>
  );
}
