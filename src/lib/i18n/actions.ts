"use server";

import { cookies } from "next/headers";
import { LANG_COOKIE, THEME_COOKIE, LANGS, THEMES } from "./index";

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function setLanguage(value: string) {
  if (!(LANGS as readonly string[]).includes(value)) return;
  const store = await cookies();
  store.set(LANG_COOKIE, value, { path: "/", maxAge: ONE_YEAR, sameSite: "lax" });
}

export async function setTheme(value: string) {
  if (!(THEMES as readonly string[]).includes(value)) return;
  const store = await cookies();
  if (value === "system") {
    store.delete(THEME_COOKIE);
  } else {
    store.set(THEME_COOKIE, value, { path: "/", maxAge: ONE_YEAR, sameSite: "lax" });
  }
}
