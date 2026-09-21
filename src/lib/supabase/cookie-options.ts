// The login session lives in cookies. Make them long-lived so people stay
// signed in on their phone (also after closing the app or restarting the
// phone), and keep them out of cross-site requests.
export const SESSION_COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 400, // the maximum browsers allow
  secure: process.env.NODE_ENV === "production",
};
