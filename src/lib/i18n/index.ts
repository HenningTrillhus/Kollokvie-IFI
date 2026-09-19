import { messages, PROGRAM_NAMES_EN } from "./messages";

export const LANGS = ["no", "en"] as const;
export type Lang = (typeof LANGS)[number];

export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export type MessageKey = keyof typeof messages;
export type Vars = Record<string, string | number>;
export type TFunction = (key: MessageKey, vars?: Vars) => string;

export const LANG_COOKIE = "lang";
export const THEME_COOKIE = "theme";

export function parseLang(value: string | undefined | null): Lang {
  return value === "en" ? "en" : "no";
}

export function parseTheme(value: string | undefined | null): Theme {
  return value === "dark" ? "dark" : "light";
}

export function translate(lang: Lang, key: MessageKey, vars?: Vars): string {
  const text: string = messages[key][lang];
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match
  );
}

export function makeT(lang: Lang): TFunction {
  return (key, vars) => translate(lang, key, vars);
}

export function localeFor(lang: Lang) {
  return lang === "en" ? "en-GB" : "nb-NO";
}

export function programLabel(lang: Lang, program: string) {
  return lang === "en" ? PROGRAM_NAMES_EN[program] ?? program : program;
}

// "dd.mm.yyyy" in Norwegian, "25 Sep 2026" in English.
export function formatDate(dateStr: string | null, lang: Lang) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  if (lang === "no") {
    return `${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}.${year}`;
  }
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
