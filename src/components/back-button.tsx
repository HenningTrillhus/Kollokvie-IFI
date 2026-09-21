"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";

// "Back": goes to the previous page, or to the front page when there is
// nothing to go back to (a link opened in a new tab).
export default function BackButton({
  label,
  fallbackHref = "/",
}: {
  label?: string;
  fallbackHref?: string;
}) {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <button
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(fallbackHref);
      }}
      // Padding makes the tap area finger-sized; the negative margin keeps the text aligned.
      className="-ml-2 rounded-lg px-2 py-2 text-sm font-medium text-muted transition hover:text-foreground active:bg-accent-soft"
    >
      {label ?? t("common.back")}
    </button>
  );
}
