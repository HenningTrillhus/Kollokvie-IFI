"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n/client";

// A round "pick any color" button. It opens the device's own color picker, so
// it works the same on phones and computers. The color is committed once, when
// the picker is closed (not on every drag), so we don't save dozens of times.
export default function ColorSwatchInput({
  value,
  active,
  onCommit,
  className = "h-7 w-7",
}: {
  // The current color, shown inside the ring while a custom color is in use.
  value: string;
  // True when the current color is a custom one (not from the ready-made list).
  active: boolean;
  onCommit: (color: string) => void;
  className?: string;
}) {
  const { t } = useI18n();
  const input = useRef<HTMLInputElement>(null);
  const commit = useRef(onCommit);

  useEffect(() => {
    commit.current = onCommit;
  }, [onCommit]);

  // Keep the picker in step when the color changes from elsewhere.
  useEffect(() => {
    if (input.current) input.current.value = value;
  }, [value]);

  useEffect(() => {
    const el = input.current;
    if (!el) return;
    const handler = () => commit.current(el.value.toLowerCase());
    el.addEventListener("change", handler);
    return () => el.removeEventListener("change", handler);
  }, []);

  return (
    <label
      title={t("color.custom")}
      className={`relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full transition active:scale-90 ${className} ${
        active ? "ring-2 ring-foreground ring-offset-2 ring-offset-card" : "hover:scale-110"
      }`}
      style={{
        background: active
          ? value
          : "conic-gradient(#ef4444, #f59e0b, #22c55e, #06b6d4, #6366f1, #d946ef, #ef4444)",
      }}
    >
      {!active && (
        <span className="flex h-[55%] w-[55%] items-center justify-center rounded-full bg-card text-sm font-semibold leading-none text-foreground">
          +
        </span>
      )}
      <input
        ref={input}
        type="color"
        defaultValue={value}
        aria-label={t("color.custom")}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </label>
  );
}
