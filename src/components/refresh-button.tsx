"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function RefreshButton({ label = "Oppdater" }: { label?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => router.refresh())}
      disabled={pending}
      aria-label={label}
      title={label}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-accent-soft hover:text-foreground active:scale-90 disabled:opacity-70"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        className={`h-[18px] w-[18px] ${pending ? "animate-spin" : ""}`}
      >
        <path
          d="M20 12a8 8 0 11-2.34-5.66M20 4v4.5h-4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
