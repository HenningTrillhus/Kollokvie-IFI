import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { buildCsp } from "@/lib/csp";

// Runs before every page: refreshes the login session, redirects visitors who
// are not signed in, and attaches a per-request Content-Security-Policy.
export async function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  return updateSession(request, { nonce, header: buildCsp(nonce) });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icon|apple-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
