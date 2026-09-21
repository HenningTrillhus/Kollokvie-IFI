"use client";

import { useTransition } from "react";
import { Card } from "@/components/form-ui";
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
    <Card>
      <Row label={t("settings.theme")}>
        <Segmented
          label={t("settings.theme")}
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
          label={t("settings.language")}
          options={LANGS.map((value) => ({ value, label: LANG_NAMES[value] }))}
          value={lang}
          disabled={pending}
          onChange={(value) => startTransition(() => setLanguage(value))}
        />
      </Row>
    </Card>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </div>
  );
}

// A pill switcher whose highlight slides to the chosen option.
function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value)
  );

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="relative grid rounded-xl border border-card-border p-0.5 text-sm font-medium"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden
        className="absolute inset-y-0.5 left-0.5 rounded-lg bg-accent-soft transition-transform duration-300 ease-out motion-reduce:transition-none"
        style={{
          width: `calc((100% - 4px) / ${options.length})`,
          transform: `translateX(${index * 100}%)`,
        }}
      />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className={`relative rounded-lg px-3.5 py-1.5 transition-colors disabled:opacity-70 ${
            value === option.value ? "text-accent" : "text-muted hover:text-foreground"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
