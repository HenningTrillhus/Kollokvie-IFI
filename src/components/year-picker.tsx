"use client";

import Segmented from "@/components/segmented";
import { useI18n } from "@/lib/i18n/client";

const YEARS = ["1", "2", "3", "4", "5"];

// Study year as five buttons ("1. år" ... "5. år"), not a browser dropdown.
// Value is "" (not chosen) or "1".."5". Tap "Fjern valg" to clear it.
export default function YearPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useI18n();

  return (
    <div className="space-y-2">
      {/* With nothing chosen, no button is highlighted (the pill stays out of sight). */}
      <div className={value ? "" : "[&>div>span[aria-hidden]]:opacity-0"}>
        <Segmented
          fill
          label={t("settings.year")}
          value={value}
          onChange={onChange}
          options={YEARS.map((y) => ({ value: y, label: t("profile.year", { n: y }) }))}
        />
      </div>
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-xs font-medium text-muted transition hover:text-foreground"
        >
          {t("year.clear")}
        </button>
      )}
    </div>
  );
}
