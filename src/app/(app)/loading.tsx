import { getT } from "@/lib/i18n/server";

export default async function Loading() {
  const { t } = await getT();
  return (
    <div
      className="mx-auto w-full max-w-lg px-6 py-6"
      role="status"
      aria-label={t("common.loadingAria")}
    >
      <div className="h-10 animate-pulse rounded-xl bg-accent-soft" />

      <div className="mt-5 space-y-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-card-border bg-accent-soft/40"
          />
        ))}
      </div>
    </div>
  );
}
