"use client";

import { useTransition } from "react";
import { useI18n } from "@/lib/i18n/client";
import { setLanguage, setTheme } from "@/lib/i18n/actions";
import { LANGS, THEMES, type Lang, type Theme } from "@/lib/i18n";

const LANG_NAMES: Record<Lang, string> = { no: "Norsk", en: "English" };

// Applies the theme to <html> straight away; the cookie (set by the server
// action) makes it stick and lets the server render the right theme.
function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export default function AppearanceSettings() {
  const { t, lang, theme } = useI18n();
  const [pending, startTransition] = useTransition();

  const themeLabels: Record<Theme, string> = {
    light: t("settings.themeLight"),
    dark: t("settings.themeDark"),
  };

  return (
    <section className="mt-10 space-y-2.5 border-t border-card-border pt-4">
      <Row label={t("settings.theme")}>
        <Segmented
          options={THEMES.map((value) => ({ value, label: themeLabels[value] }))}
          value={theme}
          disabled={pending}
          onChange={(value) => {
            applyTheme(value);
            startTransition(() => setTheme(value));
          }}
        />
      </Row>
      <Row label={t("settings.language")}>
        <Segmented
          options={LANGS.map((value) => ({ value, label: LANG_NAMES[value] }))}
          value={lang}
          disabled={pending}
          onChange={(value) => startTransition(() => setLanguage(value))}
        />
      </Row>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted">{label}</span>
      {children}
    </div>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
  disabled,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      className="flex rounded-lg border border-card-border p-0.5 text-xs font-medium"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className={`rounded-md px-2.5 py-1 transition disabled:opacity-70 ${
            value === option.value
              ? "bg-accent-soft text-accent"
              : "text-muted hover:text-foreground"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
