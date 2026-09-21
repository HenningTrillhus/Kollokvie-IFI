import type { Policy } from "@/lib/privacy-content";
import { CONTACT_EMAIL, PRIVACY_UPDATED } from "@/lib/privacy";
import { getT } from "@/lib/i18n/server";

// Renders one legal text (privacy policy, terms, cookie policy) in the user's
// language, with the contact details at the bottom.
export default async function LegalDocument({ policy }: { policy: Policy }) {
  const { t, lang } = await getT();

  return (
    <article className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{policy.title}</h1>
        <p className="mt-1 text-xs text-muted">
          {t("privacy.updated", { date: PRIVACY_UPDATED[lang] })}
        </p>
        <p className="mt-4 text-sm leading-relaxed">{policy.intro}</p>
      </header>

      {policy.sections.map((section, i) => (
        <section
          key={section.heading}
          aria-labelledby={`legal-h-${i}`}
          className="space-y-3 rounded-2xl border border-card-border bg-card p-4"
        >
          <h2 id={`legal-h-${i}`} className="text-sm font-semibold">
            {section.heading}
          </h2>
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

      <section
        aria-labelledby="h-contact"
        className="space-y-2 rounded-2xl border border-card-border bg-card p-4"
      >
        <h2 id="h-contact" className="text-sm font-semibold">
          {t("privacy.contactHeading")}
        </h2>
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
