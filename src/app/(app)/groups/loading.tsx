import { getT } from "@/lib/i18n/server";

export default async function Loading() {
  const { t } = await getT();
  return (
    <div
      className="mx-auto w-full max-w-md space-y-4 px-6 pb-6 pt-5 md:max-w-3xl md:pt-7 xl:max-w-6xl"
      role="status"
      aria-label={t("common.loadingAria")}
    >
      <div className="h-[132px] animate-pulse rounded-2xl border border-card-border bg-accent-soft/40" />
      <div className="grid gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{ animationDelay: `${i * 100}ms` }}
            className="h-32 animate-pulse rounded-2xl border border-card-border bg-accent-soft/40"
          />
        ))}
      </div>
    </div>
  );
}
