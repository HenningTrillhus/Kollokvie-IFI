import { cache } from "react";
import { cookies } from "next/headers";
import {
  LANG_COOKIE,
  THEME_COOKIE,
  makeT,
  parseLang,
  parseTheme,
} from "./index";

export const getPrefs = cache(async () => {
  const store = await cookies();
  return {
    lang: parseLang(store.get(LANG_COOKIE)?.value),
    theme: parseTheme(store.get(THEME_COOKIE)?.value),
  };
});

// For server components: `const { t, lang } = await getT();`
export async function getT() {
  const { lang } = await getPrefs();
  return { lang, t: makeT(lang) };
}
