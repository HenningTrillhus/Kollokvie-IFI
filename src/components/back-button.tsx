"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";

export default function BackButton({ label }: { label?: string }) {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <button
      onClick={() => router.back()}
      className="text-sm font-medium text-muted transition hover:text-foreground"
    >
      {label ?? t("common.back")}
    </button>
  );
}
