"use client";

import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";

const LENGTH = 6;

export default function OtpInput({
  disabled,
  onSubmit,
}: {
  disabled?: boolean;
  onSubmit: (code: string) => void;
}) {
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(""));
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  function setDigit(index: number, value: string) {
    if (!/^[0-9]?$/.test(value)) return;

    const next = [...digits];
    next[index] = value;
    setDigits(next);

    if (value && index < LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }

    if (value && index === LENGTH - 1) {
      const code = next.join("");
      if (code.length === LENGTH) onSubmit(code);
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!pasted) return;
    event.preventDefault();

    const next = Array(LENGTH).fill("");
    pasted.split("").forEach((char, i) => (next[i] = char));
    setDigits(next);

    const lastIndex = Math.min(pasted.length, LENGTH) - 1;
    inputs.current[lastIndex]?.focus();

    if (pasted.length === LENGTH) onSubmit(pasted);
  }

  return (
    <div className="flex justify-center gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          autoFocus={index === 0}
          onChange={(e) => setDigit(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="h-12 w-10 rounded-xl border border-card-border bg-transparent text-center text-lg font-medium outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft disabled:opacity-60"
        />
      ))}
    </div>
  );
}
