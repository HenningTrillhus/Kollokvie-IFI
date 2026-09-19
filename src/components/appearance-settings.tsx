"use client";

import { useTransition } from "react";
import { useI18n } from "@/lib/i18n/client";
import { setLanguage, setTheme } from "@/lib/i18n/actions";
import { LANGS, THEMES, type Lang, type Theme } from "@/lib/i18n";

const LANG_NAMES: Record<Lang, string> = { no: "Norsk", en: "English" };

// Applies the theme to <html> straight away; the cookie (set by the server
// action) makes it stick and lets the server render the right theme.
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}

export default function AppearanceSettings() {
  const { t, lang, theme } = useI18n();
  const [pending, startTransition] = useTransition();

  const themeLabels: Record<Theme, string> = {
    system: t("settings.themeSystem"),
    light: t("settings.themeLight"),
    dark: t("settings.themeDark"),
  };

  return (
    <section className="mt-6 space-y-4 rounded-xl border border-card-border p-4">
      <h2 className="text-sm font-semibold">{t("settings.appearance")}</h2>

      <div>
        <p className="mb-1.5 text-sm font-medium">{t("settings.theme")}</p>
        <Segmented
          options={THEMES.map((value) => ({ value, label: themeLabels[value] }))}
          value={theme}
          disabled={pending}
          onChange={(value) => {
            applyTheme(value);
            startTransition(() => setTheme(value));
          }}
        />
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium">{t("settings.language")}</p>
        <Segmented
          options={LANGS.map((value) => ({ value, label: LANG_NAMES[value] }))}
          value={lang}
          disabled={pending}
          onChange={(value) => startTransition(() => setLanguage(value))}
        />
      </div>
    </section>
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
      className="grid rounded-xl border border-card-border p-1 text-sm font-medium"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className={`rounded-lg px-3 py-1.5 transition disabled:opacity-70 ${
            value === option.value ? "bg-accent text-white" : "text-muted"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
