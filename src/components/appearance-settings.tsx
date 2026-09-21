"use client";

import { useTransition } from "react";
import { Card } from "@/components/form-ui";
import Segmented from "@/components/segmented";
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
