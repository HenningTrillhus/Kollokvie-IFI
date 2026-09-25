import type { MessageKey } from "@/lib/i18n";

// Shortest password we accept when someone sets a new one (sign-up, reset,
// change). Older accounts with shorter passwords can still log in. Set the
// same minimum in Supabase → Authentication → Sign In / Providers → Email.
export const MIN_PASSWORD_LENGTH = 8;

// The passwords people pick most, in English and Norwegian. Compared after
// turning "p@ssw0rd" into "password" and dropping digits and symbols.
const COMMON = new Set([
  "password", "passord", "passwort", "qwerty", "qwertyuiop", "qwertyui", "asdfgh", "asdfghjkl",
  "zxcvbn", "zxcvbnm", "abcdef", "abcdefgh", "letmein", "welcome", "velkommen", "monkey", "dragon",
  "master", "login", "admin", "iloveyou", "jegelskerdeg", "football", "fotball", "baseball",
  "superman", "batman", "sunshine", "princess", "shadow", "trustno", "starwars", "hallo", "hei",
  "heihei", "heisann", "norge", "norway", "oslo", "uio", "ifi", "kollokvie", "kollokviegruppe",
  "student", "studentene", "universitet", "informatikk", "programmering", "python", "java", "test",
  "testing", "abc", "aaaa", "sommer", "vinter", "summer", "winter", "liverpool", "arsenal",
  "chelsea", "manutd", "rosenborg", "molde", "vålerenga", "valerenga", "lyn", "brann",
]);

// Number-only passwords that are always among the first guesses.
const COMMON_NUMBERS = /^(0123456789?|1234567890?|123456789?|12345678|87654321|9876543210?|11111111|00000000|12341234|123123123|1q2w3e4r|11223344|696969|121212|112233)$/;

const LEET: Record<string, string> = {
  "@": "a", "4": "a", "0": "o", "1": "l", "!": "i", "3": "e", "$": "s", "5": "s", "7": "t",
};

// Two readings of the same password: just the letters ("Passord123" -> "passord")
// and with look-alike symbols swapped in ("p@ssw0rd" -> "password").
function readings(password: string) {
  const lower = password.toLowerCase();
  return [
    lower.replace(/[^a-zæøå]/g, ""),
    lower.replace(/[@4013$!57]/g, (c) => LEET[c] ?? c).replace(/[^a-zæøå]/g, ""),
  ];
}

// "aaaaaaaa", "abababab", "12345678", "abcdefgh"
function isPattern(password: string) {
  if (/^(.)\1+$/.test(password)) return true;
  if (/^(.{1,3})\1+$/.test(password)) return true;
  const codes = [...password.toLowerCase()].map((c) => c.charCodeAt(0));
  const step = codes[1] - codes[0];
  return (
    Math.abs(step) === 1 && codes.every((c, i) => i === 0 || c - codes[i - 1] === step)
  );
}

export type PasswordCheck = {
  ok: boolean;
  // 0 = empty, 1 = not accepted (red), 2 = accepted (yellow), 3 = accepted, letters + a
  // number + a symbol (green).
  score: 0 | 1 | 2 | 3;
  // What to tell the user when it isn't accepted.
  problem?: MessageKey;
};

// The only real requirement is length: at least 8 characters (any mix of
// letters, digits or symbols), and not one of the most-used passwords, a
// simple repeat/sequence, or built from the user's own name or username.
// Beyond that it's just a nudge, shown as the strength color: letters and a
// number is fine (yellow), adding a symbol on top is best (green), neither
// is required.
export function checkPassword(
  password: string,
  personal: { username?: string; name?: string } = {}
): PasswordCheck {
  if (!password) return { ok: false, score: 0 };

  if (password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, score: 1, problem: "auth.passwordShort" };
  }

  const lower = password.toLowerCase();
  const parts = [
    personal.username ?? "",
    ...(personal.name ?? "").split(/\s+/),
  ]
    .map((p) => p.toLowerCase().replace(/[^a-z0-9æøå]/g, ""))
    .filter((p) => p.length >= 3);
  if (parts.some((p) => lower.includes(p))) {
    return { ok: false, score: 1, problem: "pw.personal" };
  }

  if (readings(password).some((r) => COMMON.has(r)) || COMMON_NUMBERS.test(lower)) {
    return { ok: false, score: 1, problem: "pw.common" };
  }
  if (isPattern(password)) return { ok: false, score: 1, problem: "pw.pattern" };

  const hasLetter = /[a-zæøåA-ZÆØÅ]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^A-Za-zæøåÆØÅ0-9]/.test(password);
  return { ok: true, score: hasLetter && hasDigit && hasSymbol ? 3 : 2 };
}
