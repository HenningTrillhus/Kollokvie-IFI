// Shortest password we accept when someone sets a new one (sign-up, reset,
// change). Older accounts with shorter passwords can still log in. Set the
// same minimum in Supabase → Authentication → Sign In / Providers → Email.
export const MIN_PASSWORD_LENGTH = 8;
