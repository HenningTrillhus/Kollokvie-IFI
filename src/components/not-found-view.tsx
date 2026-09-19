import Link from "next/link";
import { getT } from "@/lib/i18n/server";

export default async function NotFoundView({
  href,
  labelKey,
  fullScreen,
}: {
  href: string;
  labelKey: "notFound.toStart" | "notFound.toExplore";
  fullScreen?: boolean;
}) {
  const { t } = await getT();
  return (
    <div
      className={`flex flex-1 flex-col items-center justify-center px-6 py-16 text-center ${
        fullScreen ? "min-h-screen" : ""
      }`}
    >
      <p className="text-6xl font-semibold tracking-tight text-accent">404</p>
      <h1 className="mt-4 text-lg font-semibold">{t("notFound.title")}</h1>
      <p className="mt-2 max-w-xs text-sm text-muted">
        {t("notFound.text")}
      </p>
      <Link
        href={href}
        className="mt-6 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover active:scale-95"
      >
        {t(labelKey)}
      </Link>
    </div>
  );
}
