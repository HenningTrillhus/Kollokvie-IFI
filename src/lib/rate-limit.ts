// Request throttling for the web server (used in src/proxy.ts).
//
// Deliberately generous: many students share one campus network address, so a
// limit per address has to be far above what any real crowd would send. The
// aim is only to stop floods and scripts. The counters live in this server
// instance's memory, so each instance protects itself (a global limit is set
// with Vercel Firewall, see docs). Limits per *user* on writes live in the
// database (migration 0037).

type Counter = { count: number; windowStart: number };

const WINDOW_MS = 60_000;
const BAN_MS = 5 * 60_000;

// Per minute. IP address: a ceiling only a flood reaches. Session: one browser.
const LIMITS = {
  ipGet: 6000,
  ipPost: 600,
  sessionAny: 1200,
} as const;

const counters = new Map<string, Counter>();
const bans = new Map<string, number>();
let sinceCleanup = 0;

function cleanup(now: number) {
  sinceCleanup = 0;
  for (const [key, c] of counters) if (now - c.windowStart > WINDOW_MS * 2) counters.delete(key);
  for (const [key, until] of bans) if (until < now) bans.delete(key);
  // Never let a flood of made-up keys grow memory without end.
  if (counters.size > 50_000) counters.clear();
}

function bump(key: string, now: number): number {
  const c = counters.get(key);
  if (!c || now - c.windowStart >= WINDOW_MS) {
    counters.set(key, { count: 1, windowStart: now });
    return 1;
  }
  c.count += 1;
  return c.count;
}

export type Verdict = { allowed: true } | { allowed: false; retryAfter: number };

// A short, non-reversible label for a session cookie (never the cookie itself).
function label(value: string): string {
  let h = 5381;
  for (let i = 0; i < value.length; i++) h = ((h << 5) + h + value.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

export function checkRequest(input: {
  ip: string;
  method: string;
  sessionCookie?: string;
}): Verdict {
  const now = Date.now();
  if (++sinceCleanup > 2000) cleanup(now);

  const ipKey = `ip:${input.ip}`;
  const bannedUntil = bans.get(ipKey);
  if (bannedUntil && bannedUntil > now) {
    return { allowed: false, retryAfter: Math.ceil((bannedUntil - now) / 1000) };
  }

  const isRead = input.method === "GET" || input.method === "HEAD";
  const ipLimit = isRead ? LIMITS.ipGet : LIMITS.ipPost;
  const ipCount = bump(`${ipKey}:${isRead ? "r" : "w"}`, now);

  // Far beyond the ceiling: block this address for a few minutes.
  if (ipCount > ipLimit * 1.5) {
    bans.set(ipKey, now + BAN_MS);
    return { allowed: false, retryAfter: Math.ceil(BAN_MS / 1000) };
  }
  if (ipCount > ipLimit) return { allowed: false, retryAfter: 30 };

  if (input.sessionCookie) {
    const sessionCount = bump(`s:${label(input.sessionCookie)}`, now);
    if (sessionCount > LIMITS.sessionAny) return { allowed: false, retryAfter: 30 };
  }

  return { allowed: true };
}

// The visitor's address on Vercel (and behind other proxies).
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim() || "unknown";
  return headers.get("x-real-ip") ?? "unknown";
}
