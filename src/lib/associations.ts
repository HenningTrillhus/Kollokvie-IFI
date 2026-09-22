import type { SupabaseClient } from "@supabase/supabase-js";
import { cleanLine } from "@/lib/sanitize";

export type Association = { slug: string; name: string; icon: string };

// Fixed list of IFI student associations, in the order they should show when
// browsing (not searching) — biggest/best-known first. Kept in sync with the
// check constraint on user_associations (supabase/migrations/0045_*.sql).
export const ASSOCIATIONS: Association[] = [
  { slug: "dagen", name: "Dagen@ifi", icon: "/associations/dagen.webp" },
  { slug: "navet", name: "Navet", icon: "/associations/navet.webp" },
  { slug: "maps", name: "Maps", icon: "/associations/maps.webp" },
  { slug: "fadderstyret", name: "Fadderstyret ved IFI", icon: "/associations/fadderstyret.webp" },
  { slug: "cybernetisk-selskab", name: "Cybernetisk Selskab", icon: "/associations/cybernetisk-selskab.webp" },
  { slug: "sifi", name: "SIFI", icon: "/associations/sifi.webp" },
  { slug: "sonen", name: "Sonen", icon: "/associations/sonen.webp" },
  { slug: "pga-ifi", name: "PGA IFI", icon: "/associations/pga-ifi.webp" },
  { slug: "creators-guild", name: "ifi-Creators' Guild", icon: "/associations/creators-guild.webp" },
  { slug: "maki", name: "MA:KI", icon: "/associations/maki.webp" },
  { slug: "toast-jaern", name: "Toast Jærn", icon: "/associations/toast-jaern.webp" },
  { slug: "defi", name: "DEFI", icon: "/associations/defi.webp" },
  { slug: "progsys", name: "ProgSys", icon: "/associations/progsys.webp" },
  { slug: "fifi", name: "FIFI", icon: "/associations/fifi.webp" },
  { slug: "digitus", name: "Digitus", icon: "/associations/digitus.webp" },
  { slug: "rastlos", name: "IFI Rastløs", icon: "/associations/rastlos.webp" },
  { slug: "fui", name: "FUI", icon: "/associations/fui.webp" },
  { slug: "pitch", name: "PiTCH", icon: "/associations/pitch.webp" },
  { slug: "mikro", name: "Mikro", icon: "/associations/mikro.webp" },
  { slug: "runtime", name: "Runtime", icon: "/associations/runtime.webp" },
  { slug: "output", name: ">Output", icon: "/associations/output.webp" },
  { slug: "readline", name: "readLine", icon: "/associations/readline.webp" },
  { slug: "vifi", name: "VIFI", icon: "/associations/vifi.webp" },
  { slug: "realitiifi", name: "RealitiIFI", icon: "/associations/realitiifi.webp" },
  { slug: "pitbulls", name: "ifiPitBulls", icon: "/associations/pitbulls.webp" },
  { slug: "quizifi", name: "QuizIFI", icon: "/associations/quizifi.webp" },
];

const BY_SLUG = new Map(ASSOCIATIONS.map((a) => [a.slug, a]));

export function associationBySlug(slug: string): Association | undefined {
  return BY_SLUG.get(slug);
}

export type UserAssociation = { association: string; title: string };

export async function getUserAssociations(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("user_associations")
    .select("association, title")
    .eq("user_id", userId);
  return (data ?? []) as UserAssociation[];
}

// "" for nothing typed, the cleaned title if it's a valid length, or null.
export function parseAssociationTitle(input: string): string | null {
  const clean = cleanLine(input);
  if (!clean) return "";
  return clean.length <= 40 ? clean : null;
}
