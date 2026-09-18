// Supabase's auth is email/password under the hood, but the app only ever
// shows an IFI username. We derive a stable, unique synthetic email from it
// and use the user's real (self-chosen) password for the rest.
export function emailForIfiUsername(ifiUsername: string) {
  return `${ifiUsername.trim().toLowerCase()}@kollokvie.internal`;
}
