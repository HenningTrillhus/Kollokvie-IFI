"use client";

import type { RefObject } from "react";
import { inputClass } from "@/components/form-ui";
import { useI18n } from "@/lib/i18n/client";

// A search box with an ✕ on the right (once you've typed something) that
// clears the text in one tap and keeps the keyboard up.
export default function SearchInput({
  value,
  onChange,
  placeholder,
  inputRef,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  inputRef?: RefObject<HTMLInputElement | null>;
}) {
  const { t } = useI18n();

  return (
    <div className="relative min-w-0 flex-1">
      <input
        ref={inputRef}
        type="search"
        enterKeyHint="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} ${value ? "pr-11" : ""}`}
      />
      {value && (
        <button
          type="button"
          aria-label={t("common.clear")}
          // Keep focus in the box so the keyboard doesn't close.
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            onChange("");
            inputRef?.current?.focus();
          }}
          className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted transition hover:bg-accent-soft hover:text-foreground active:scale-90"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
