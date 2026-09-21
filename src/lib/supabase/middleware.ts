import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_OPTIONS } from "./cookie-options";

// Pages anyone may open without being signed in. Matched exactly, or as a
// folder ("/vilkar/x"), so "/vilkarfoo" is not public by accident.
const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/personvern",
  "/vilkar",
  "/informasjonskapsler",
  "/tilgjengelighet",
  "/glemt-passord",
  "/.well-known",
];
const AUTH_PAGES = ["/login", "/signup"];

function isPublic(pathname: string) {
  return (
    pathname === "/" ||
    PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
  );
}

export async function updateSession(
  request: NextRequest,
  csp?: { nonce: string; header: string }
) {
  // Next.js reads the nonce from the request's CSP header and puts it on its own scripts.
  const forwardHeaders = () => {
    const headers = new Headers(request.headers);
    if (csp) {
      headers.set("x-nonce", csp.nonce);
      headers.set("content-security-policy", csp.header);
    }
    return headers;
  };
  const finish = (response: NextResponse) => {
    if (csp) response.headers.set("Content-Security-Policy", csp.header);
    return response;
  };

  let supabaseResponse = NextResponse.next({ request: { headers: forwardHeaders() } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: SESSION_COOKIE_OPTIONS,
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request: { headers: forwardHeaders() } });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getClaims() verifies the JWT locally against the project's cached public
  // signing key instead of round-tripping to the Auth server like getUser()
  // does on every single request — this ran on every navigation, so it was
  // the single biggest contributor to the app feeling slow to click around.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims ?? null;

  const { pathname } = request.nextUrl;

  if (!user && !isPublic(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return finish(NextResponse.redirect(url));
  }

  if (user && AUTH_PAGES.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return finish(NextResponse.redirect(url));
  }

  return finish(supabaseResponse);
}
