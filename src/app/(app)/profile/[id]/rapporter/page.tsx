import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/get-user";
import { UUID_PATTERN, getProfileById } from "@/lib/profiles";
import { REPORT_EMAIL } from "@/lib/privacy";
import { FlagIcon } from "@/components/meta-icons";
import BackButton from "@/components/back-button";
import { Page } from "@/components/form-ui";
import { getT } from "@/lib/i18n/server";

// Report someone's profile: no in-app moderation queue, just a direct email
// with enough to identify the account (see docs/oppsett-og-drift.md).
export default async function ReportUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getT();
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const profile = UUID_PATTERN.test(id) ? await getProfileById(supabase, id) : null;
  if (!profile) notFound();
  if (profile.id === user.id) redirect("/profile");

  const subject = encodeURIComponent(t("report.subject"));
  const body = encodeURIComponent(
    `${t("report.bodyUser")}: ${profile.full_name}${profile.username ? ` (@${profile.username})` : ""}\n` +
      `${t("report.bodyId")}: ${profile.id}\n\n` +
      `${t("report.bodyReason")}:\n`
  );

  return (
    <Page>
      <BackButton />

      <div className="space-y-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent">
          <FlagIcon className="h-5 w-5" />
        </div>
        <h1 className="text-xl font-semibold">{t("report.title", { name: profile.full_name })}</h1>
        <p className="text-sm leading-relaxed text-muted">{t("report.intro")}</p>
      </div>

      <div className="space-y-3 rounded-2xl border border-card-border bg-card p-4">
        <p className="text-sm leading-relaxed text-muted">{t("report.hint")}</p>
        <a
          href={`mailto:${REPORT_EMAIL}?subject=${subject}&body=${body}`}
          className="flex h-11 items-center justify-center rounded-xl bg-accent px-4 text-sm font-medium text-white transition hover:bg-accent-hover"
        >
          {t("report.button")}
        </a>
        <p className="text-center text-xs text-muted">{REPORT_EMAIL}</p>
      </div>
    </Page>
  );
}
