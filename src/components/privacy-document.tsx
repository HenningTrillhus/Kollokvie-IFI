import { getPolicy } from "@/lib/privacy-content";
import { CONTACT_EMAIL, PRIVACY_UPDATED } from "@/lib/privacy";
import { getT } from "@/lib/i18n/server";

// The full privacy policy, in the user's language.
export default async function PrivacyDocument() {
  const { t, lang } = await getT();
  const policy = getPolicy(lang);

  return (
    <article className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{policy.title}</h1>
        <p className="mt-1 text-xs text-muted">
          {t("privacy.updated", { date: PRIVACY_UPDATED[lang] })}
        </p>
        <p className="mt-4 text-sm leading-relaxed">{policy.intro}</p>
      </header>

      {policy.sections.map((section) => (
        <section
          key={section.heading}
          className="space-y-3 rounded-2xl border border-card-border bg-card p-4"
        >
          <h2 className="text-sm font-semibold">{section.heading}</h2>
          {section.paragraphs?.map((p) => (
            <p key={p} className="text-sm leading-relaxed text-muted">
              {p}
            </p>
          ))}
          {section.bullets && (
            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted marker:text-accent">
              {section.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <section className="space-y-2 rounded-2xl border border-card-border bg-card p-4">
        <h2 className="text-sm font-semibold">{t("privacy.contactHeading")}</h2>
        <p className="text-sm leading-relaxed text-muted">
          {CONTACT_EMAIL ? (
            <>
              {t("privacy.contactEmailLead")}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-medium text-accent hover:text-accent-hover"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </>
          ) : (
            t("privacy.contactNone")
          )}
        </p>
      </section>
    </article>
  );
}
