"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";
import { SIGNED_IN_TOAST_KEY } from "@/components/signed-in-toast";

export default function SignOutButton() {
  const router = useRouter();
  const { t } = useI18n();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    try {
      sessionStorage.removeItem(SIGNED_IN_TOAST_KEY);
    } catch {
      // ignore
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="h-10 rounded-xl border border-card-border px-4 text-sm font-medium text-muted transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500 active:scale-[0.99]"
    >
      {t("auth.signOut")}
    </button>
  );
}
