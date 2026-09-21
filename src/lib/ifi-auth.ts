// Sign-in is email + password under the hood, but people only ever type their
// IFI username. The account's email is <username>@uio.no, and since a 6-digit
// code is sent to that address when you sign up, having an account proves you
// have access to that UiO mailbox.

export const IFI_EMAIL_DOMAIN = "uio.no";

// Accounts made before email verification existed use a made-up address.
// They keep working, and are asked to verify their real UiO email once.
export const LEGACY_EMAIL_DOMAIN = "kollokvie.internal";

// Turned on (NEXT_PUBLIC_EMAIL_VERIFICATION=1) once Supabase is set up to send
// the codes, so the app never asks for a code that can't be delivered.
export const EMAIL_VERIFICATION_ENABLED = process.env.NEXT_PUBLIC_EMAIL_VERIFICATION === "1";

export function ifiEmail(ifiUsername: string) {
  return `${ifiUsername.trim().toLowerCase()}@${IFI_EMAIL_DOMAIN}`;
}

export function legacyEmail(ifiUsername: string) {
  return `${ifiUsername.trim().toLowerCase()}@${LEGACY_EMAIL_DOMAIN}`;
}

// The email a new account is created with.
export function emailForIfiUsername(ifiUsername: string) {
  return EMAIL_VERIFICATION_ENABLED ? ifiEmail(ifiUsername) : legacyEmail(ifiUsername);
}

// The emails to try when signing in (verified accounts first, then old ones).
export function loginEmails(ifiUsername: string) {
  return [ifiEmail(ifiUsername), legacyEmail(ifiUsername)];
}

export function isLegacyEmail(email: string | null | undefined) {
  return Boolean(email && email.toLowerCase().endsWith(`@${LEGACY_EMAIL_DOMAIN}`));
}
