// Bump this when the privacy policy changes in a way that needs a new consent.
// Everyone who accepted an older version is asked again on their next visit.
export const PRIVACY_VERSION = "2026-09-23.1";

// Also the "last updated" date of the terms and the cookie policy.
export const PRIVACY_UPDATED = { no: "23. september 2026", en: "23 September 2026" };

export const CONTROLLER_NAME = "Henning Trillhus";

// Set NEXT_PUBLIC_CONTACT_EMAIL in the environment to show a contact address.
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || null;

// Where "report a bug" and "report a user" send people. Fixed, not an env
// var: it's the developer's own inbox, not a general support address.
export const REPORT_EMAIL = "henninlt@uio.no";
