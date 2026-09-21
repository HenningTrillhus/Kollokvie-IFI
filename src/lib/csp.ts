// Content-Security-Policy, built fresh for every request (see src/proxy.ts).
//
// Scripts only run if they carry this request's random nonce, so an injected
// <script> or an inline event handler is blocked by the browser even if some
// user text ever slipped through unescaped. Everything else is limited to our
// own origin plus our Supabase project (API and avatar pictures).

function supabaseOrigin(): string | null {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin;
  } catch {
    return null;
  }
}

export function buildCsp(nonce: string): string {
  const dev = process.env.NODE_ENV !== "production";
  const supabase = supabaseOrigin();
  const self = "'self'";

  const directives: Record<string, string[]> = {
    "default-src": [self],
    // 'strict-dynamic' lets the nonced framework scripts load their own chunks.
    // React needs eval in development only (better error stacks).
    "script-src": [self, `'nonce-${nonce}'`, "'strict-dynamic'", ...(dev ? ["'unsafe-eval'"] : [])],
    // <style> elements need the nonce. Development uses hot-reloaded inline styles.
    "style-src": dev ? [self, "'unsafe-inline'"] : [self, `'nonce-${nonce}'`],
    // style="…" attributes (colors, animation delays) can't carry a nonce.
    // They cannot run script, so they are allowed on their own.
    "style-src-attr": ["'unsafe-inline'"],
    "img-src": [self, "data:", "blob:", ...(supabase ? [supabase] : [])],
    "font-src": [self, "data:"],
    "connect-src": [self, ...(supabase ? [supabase] : []), ...(dev ? ["ws:", "wss:"] : [])],
    "manifest-src": [self],
    "worker-src": [self, "blob:"],
    "media-src": [self],
    "object-src": ["'none'"],
    "base-uri": [self],
    "form-action": [self],
    "frame-ancestors": ["'none'"],
  };

  const parts = Object.entries(directives).map(([name, values]) => `${name} ${values.join(" ")}`);
  // Only on Vercel (always https). A local production build runs on plain http,
  // where upgrading every request to https would break it.
  if (!dev && process.env.VERCEL) parts.push("upgrade-insecure-requests");
  return parts.join("; ");
}
