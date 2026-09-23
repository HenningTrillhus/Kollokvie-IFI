import { BugIcon } from "@/components/meta-icons";
import { REPORT_EMAIL } from "@/lib/privacy";
import LegalPage from "@/components/legal-page";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "Rapporter feil · Kollokvie@IFI" };

// Public: linked next to the privacy policy everywhere that appears.
export default async function ReportBugPage() {
  const { t } = await getT();
  const subject = encodeURIComponent("Feilrapport - Kollokvie@IFI");

  return (
    <LegalPage>
      <article className="space-y-6">
        <header className="space-y-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent">
            <BugIcon className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("bug.title")}</h1>
          <p className="text-sm leading-relaxed">{t("bug.intro")}</p>
        </header>

        <section className="space-y-3 rounded-2xl border border-card-border bg-card p-4">
          <p className="text-sm leading-relaxed text-muted">{t("bug.hint")}</p>
          <a
            href={`mailto:${REPORT_EMAIL}?subject=${subject}`}
            className="flex h-11 items-center justify-center rounded-xl bg-accent px-4 text-sm font-medium text-white transition hover:bg-accent-hover"
          >
            {t("bug.button")}
          </a>
          <p className="text-center text-xs text-muted">{REPORT_EMAIL}</p>
        </section>
      </article>
    </LegalPage>
  );
}
