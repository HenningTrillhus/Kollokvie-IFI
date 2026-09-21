import type { MessageKey } from "@/lib/i18n";

// Shortest password we accept when someone sets a new one (sign-up, reset,
// change). Older accounts with shorter passwords can still log in. Set the
// same minimum in Supabase → Authentication → Sign In / Providers → Email.
export const MIN_PASSWORD_LENGTH = 8;

// A long passphrase is fine on its own; a short one needs a mix of characters.
const LONG_ENOUGH = 12;

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

function classes(password: string) {
  return [/[a-zæøå]/, /[A-ZÆØÅ]/, /\d/, /[^A-Za-zæøåÆØÅ0-9]/].filter((re) => re.test(password))
    .length;
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
  // 0 = empty, 1 = not accepted, 2 = fine, 3 = good, 4 = strong
  score: 0 | 1 | 2 | 3 | 4;
  // What to tell the user when it isn't accepted.
  problem?: MessageKey;
};

// Not "crazy strong", just not trivially guessable: at least 8 characters,
// a mix of letters and digits (or 12+ characters), and nothing from the
// most-used lists or built from the user's own name or username.
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

  const kinds = classes(password);
  if (password.length < LONG_ENOUGH && kinds < 2) {
    return { ok: false, score: 1, problem: "pw.simple" };
  }
  // 8-11 characters need letters *and* something else (a digit, capital or symbol).
  if (password.length < LONG_ENOUGH && !/[a-zæøåA-ZÆØÅ]/.test(password)) {
    return { ok: false, score: 1, problem: "pw.simple" };
  }

  const score =
    password.length >= 14 || (password.length >= LONG_ENOUGH && kinds >= 3)
      ? 4
      : password.length >= LONG_ENOUGH || (password.length >= 10 && kinds >= 3)
        ? 3
        : 2;
  return { ok: true, score };
}
