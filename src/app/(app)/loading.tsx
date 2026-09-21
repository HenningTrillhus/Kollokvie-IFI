import { getT } from "@/lib/i18n/server";

// Shown while a page loads: soft pulsing cards where the content will land.
export default async function Loading() {
  const { t } = await getT();
  return (
    <div
      className="mx-auto w-full max-w-md space-y-4 px-6 pb-6 pt-5 md:max-w-xl md:pt-7"
      role="status"
      aria-label={t("common.loadingAria")}
    >
      <div className="h-[180px] animate-pulse rounded-2xl border border-card-border bg-accent-soft/40" />
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{ animationDelay: `${i * 120}ms` }}
          className="h-24 animate-pulse rounded-2xl border border-card-border bg-accent-soft/40"
        />
      ))}
    </div>
  );
}
