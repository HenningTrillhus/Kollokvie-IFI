// Colors and visibility for the calendar: one entry per course, plus two
// special keys. Stored per user in `calendar_prefs`.

export const GROUPS_KEY = "_groups";
export const NO_COURSE_KEY = "_none";

export type Pref = { color: string | null; visible: boolean };
export type Prefs = Record<string, Pref>;

export const PALETTE = [
  "#2563eb", // blue
  "#0d9488", // teal
  "#16a34a", // green
  "#ca8a04", // yellow
  "#ea580c", // orange
  "#dc2626", // red
  "#db2777", // pink
  "#9333ea", // purple
  "#4f46e5", // indigo
  "#0891b2", // cyan
  "#78716c", // stone
  "#475569", // slate
] as const;

const GROUPS_DEFAULT = "#3f6f5e";
const NO_COURSE_DEFAULT = "#64748b";

// A stable color per course until the user picks one.
function hashColor(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function colorFor(prefs: Prefs, key: string) {
  const chosen = prefs[key]?.color;
  if (chosen) return chosen;
  if (key === GROUPS_KEY) return GROUPS_DEFAULT;
  if (key === NO_COURSE_KEY) return NO_COURSE_DEFAULT;
  return hashColor(key);
}

export function isVisible(prefs: Prefs, key: string) {
  return prefs[key]?.visible ?? true;
}
