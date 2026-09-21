import type { SupabaseClient } from "@supabase/supabase-js";

export type Profile = {
  id: string;
  full_name: string;
  // The IFI username. Hidden (null) on a private profile you don't follow.
  username: string | null;
  ifi_username: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  study_program: string | null;
  study_year: number | null;
  accent_color: string;
  // null = initial on the accent color; "preset:NN" or "upload:<v>", see lib/avatars
  avatar: string | null;
  // Which privacy policy version the user consented to (see lib/privacy.ts).
  privacy_version?: string | null;
  // Open or private profile, and whether the details are hidden from *you*.
  is_private?: boolean;
  details_hidden?: boolean;
  created_at: string;
};

// Everything about other people is read through this view. It hides the
// details of private profiles from anyone who doesn't follow them.
export const PROFILE_VIEW = "visible_profiles";

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

// Profile links can only point to GitHub or LinkedIn, and nobody types a
// link: people give only their username, and the address is built here. So
// nothing else can ever be stored or shown as a link.
const GITHUB_HANDLE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;
const LINKEDIN_HANDLE = /^[A-Za-z0-9-]{3,100}$/;

export type LinkKind = "github" | "linkedin";

// "" for nothing typed, the username if it is valid, or null if it is not.
// A pasted link is never accepted (it contains "/", "." or ":").
export function parseLinkHandle(kind: LinkKind, input: string): string | null {
  const v = input.trim().replace(/^@/, "");
  if (!v) return "";
  return (kind === "github" ? GITHUB_HANDLE : LINKEDIN_HANDLE).test(v) ? v : null;
}

// True when someone typed or pasted an address instead of just a username.
export function looksLikeLink(input: string): boolean {
  return /[/.:]/.test(input);
}

export function linkUrl(kind: LinkKind, handle: string): string {
  return kind === "github"
    ? `https://github.com/${handle}`
    : `https://www.linkedin.com/in/${handle}`;
}

// The username inside a stored address, or "" if the stored value is not
// exactly the proper GitHub / LinkedIn address.
export function handleFromUrl(kind: LinkKind, stored: string | null | undefined): string {
  if (!stored) return "";
  const match =
    kind === "github"
      ? /^https:\/\/github\.com\/([A-Za-z0-9-]+)$/.exec(stored)
      : /^https:\/\/www\.linkedin\.com\/in\/([A-Za-z0-9-]+)$/.exec(stored);
  return match ? (parseLinkHandle(kind, match[1]) ?? "") : "";
}

// A stored address, checked again before it is shown: the proper GitHub or
// LinkedIn address, or null.
export function safeLinkUrl(kind: LinkKind, stored: string | null | undefined): string | null {
  const handle = handleFromUrl(kind, stored);
  return handle ? linkUrl(kind, handle) : null;
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
    .from(PROFILE_VIEW)
    .select("*")
    .ilike("username", escapeLike(username))
    .maybeSingle();
  return data as Profile | null;
}

export async function getProfileById(supabase: SupabaseClient, id: string) {
  const { data } = await supabase
    .from(PROFILE_VIEW)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data as Profile | null;
}

export async function getProfilesByIds(supabase: SupabaseClient, ids: string[]) {
  if (ids.length === 0) return [] as Profile[];
  const { data } = await supabase.from(PROFILE_VIEW).select("*").in("id", ids);
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
