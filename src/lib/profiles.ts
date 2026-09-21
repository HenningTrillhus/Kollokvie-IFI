import type { SupabaseClient } from "@supabase/supabase-js";

export type Profile = {
  id: string;
  full_name: string;
  username: string;
  ifi_username: string;
  github_url: string | null;
  linkedin_url: string | null;
  study_program: string | null;
  study_year: number | null;
  accent_color: string;
  // null = initial on the accent color; "preset:NN" or "upload:<v>", see lib/avatars
  avatar: string | null;
  // Which privacy policy version the user consented to (see lib/privacy.ts).
  privacy_version?: string | null;
  created_at: string;
};

export const ACCENT_COLORS = [
  { key: "color.sage", value: "#3f6f5e" },
  { key: "color.blue", value: "#2563eb" },
  { key: "color.indigo", value: "#4f46e5" },
  { key: "color.purple", value: "#7c3aed" },
  { key: "color.pink", value: "#db2777" },
  { key: "color.orange", value: "#ea580c" },
  { key: "color.amber", value: "#d97706" },
  { key: "color.teal", value: "#0d9488" },
  { key: "color.slate", value: "#475569" },
] as const;

// A soft tinted background + solid text, derived from the user's chosen
// accent color, for avatars and other per-user accents. The tint is layered
// over the page background instead of being semi-transparent, so overlapping
// avatars (group cards) never show each other through.
export function avatarStyle(color: string | null | undefined) {
  const base = color || ACCENT_COLORS[0].value;
  return {
    backgroundColor: "var(--background)",
    backgroundImage: `linear-gradient(${base}22, ${base}22)`,
    color: base,
  };
}

export const STUDY_PROGRAMS = [
  "Elektronikk, informatikk og teknologi (bachelor)",
  "Informatikk: design, bruk, interaksjon (bachelor)",
  "Informatikk: digital økonomi og ledelse (bachelor)",
  "Informatikk: maskinlæring og kunstig intelligens (bachelor)",
  "Informatikk: programmering og systemarkitektur (bachelor)",
  "Informatikk: robotikk og intelligente systemer (bachelor)",
  "Computational Science (master)",
  "Data Science (master)",
  "Digitalisering i helsesektoren (master)",
  "Elektronikk, informatikk og teknologi (master)",
  "Entreprenørskap og innovasjonsledelse (master)",
  "Informatikk: design, bruk, interaksjon (master)",
  "Informatikk: digital økonomi og ledelse (master)",
  "Informatikk: informasjonssikkerhet (master)",
  "Informatikk: programmering og systemarkitektur (master)",
  "Informatikk: robotikk og intelligente systemer (master)",
  "Informatikk: språkteknologi (master)",
] as const;

// Only allow http(s) links so a stored value can never become a
// javascript:-style URL when rendered as an href.
export function sanitizeExternalUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

// For rendering a stored link: null unless it is a plain http(s) address.
export function safeExternalHref(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

// Escape LIKE wildcards so user input like "%" or "_" matches literally.
export function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

// Letters, digits, dot, underscore and hyphen: safe in URLs and unambiguous.
export const USERNAME_PATTERN = /^[A-Za-z0-9._-]{2,24}$/;
// Lowercase only: it's the part before @uio.no.
export const IFI_USERNAME_PATTERN = /^[a-z0-9._-]{1,32}$/;

export async function getProfileByUsername(
  supabase: SupabaseClient,
  username: string
) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .ilike("username", escapeLike(username))
    .maybeSingle();
  return data as Profile | null;
}

export async function getProfileById(supabase: SupabaseClient, id: string) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data as Profile | null;
}

export async function getProfilesByIds(supabase: SupabaseClient, ids: string[]) {
  if (ids.length === 0) return [] as Profile[];
  const { data } = await supabase.from("profiles").select("*").in("id", ids);
  return (data ?? []) as Profile[];
}

export async function getFollowCounts(
  supabase: SupabaseClient,
  userId: string
) {
  const { data } = await supabase
    .rpc("follow_counts", { target: userId })
    .single();
  return (data ?? { followers: 0, following: 0 }) as {
    followers: number;
    following: number;
  };
}
