// There's no email/password step in the UI — an IFI username is enough.
// Supabase's auth still needs an email + password under the hood, so we
// derive both deterministically from the username here.
export function credentialsForIfiUsername(ifiUsername: string) {
  const normalized = ifiUsername.trim().toLowerCase();
  return {
    email: `${normalized}@kollokvie.internal`,
    password: `kollokvie-${normalized}`,
  };
}
