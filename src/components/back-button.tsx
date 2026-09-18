"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ label = "← Tilbake" }: { label?: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="text-sm font-medium text-muted transition hover:text-foreground"
    >
      {label}
    </button>
  );
}
