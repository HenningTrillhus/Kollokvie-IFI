import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { buildCsp } from "@/lib/csp";
import { checkRequest, clientIp } from "@/lib/rate-limit";

// Runs before every page: throttles floods, refreshes the login session,
// redirects visitors who are not signed in, and attaches a per-request
// Content-Security-Policy.
export async function proxy(request: NextRequest) {
  const session = request.cookies
    .getAll()
    .find((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));

  const verdict = checkRequest({
    ip: clientIp(request.headers),
    method: request.method,
    sessionCookie: session?.value,
  });
  if (!verdict.allowed) {
    return new NextResponse("Too many requests. Try again in a moment.", {
      status: 429,
      headers: {
        "Retry-After": String(verdict.retryAfter),
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  const nonce = btoa(crypto.randomUUID());
  return updateSession(request, { nonce, header: buildCsp(nonce) });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icon|apple-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
