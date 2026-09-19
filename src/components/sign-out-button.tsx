"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";

export default function SignOutButton() {
  const router = useRouter();
  const { t } = useI18n();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-sm font-medium text-muted transition hover:text-foreground"
    >
      {t("auth.signOut")}
    </button>
  );
}
