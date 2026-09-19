"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { makeT, type Lang, type TFunction, type Theme } from "./index";

type Prefs = { lang: Lang; theme: Theme };

const PrefsContext = createContext<Prefs>({ lang: "no", theme: "system" });

export function I18nProvider({
  lang,
  theme,
  children,
}: Prefs & { children: ReactNode }) {
  const value = useMemo(() => ({ lang, theme }), [lang, theme]);
  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

// For client components: `const { t, lang } = useI18n();`
export function useI18n(): Prefs & { t: TFunction } {
  const { lang, theme } = useContext(PrefsContext);
  const t = useMemo(() => makeT(lang), [lang]);
  return { lang, theme, t };
}
