"use client";

import { useTransition } from "react";
import { useI18n } from "@/lib/i18n/client";
import { setLanguage } from "@/lib/i18n/actions";
import { LANGS } from "@/lib/i18n";

// Small NO / EN toggle for the logged-out pages.
export default function LanguageSwitch({ inline = false }: { inline?: boolean }) {
  const { lang } = useI18n();
  const [pending, startTransition] = useTransition();

  return (
    <div
      className={`flex rounded-lg border border-card-border p-0.5 text-xs font-medium ${
        inline ? "" : "absolute right-4 top-[calc(env(safe-area-inset-top,0px)+1rem)] z-10"
      }`}
      role="radiogroup"
      aria-label="Language"
    >
      {LANGS.map((value) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={lang === value}
          disabled={pending}
          onClick={() => startTransition(() => setLanguage(value))}
          className={`rounded-md px-3 py-2 uppercase transition ${
            lang === value ? "bg-accent text-white" : "text-muted"
          }`}
        >
          {value}
        </button>
      ))}
    </div>
  );
}
