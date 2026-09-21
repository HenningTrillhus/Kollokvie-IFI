import { createBrowserClient } from "@supabase/ssr";
import { SESSION_COOKIE_OPTIONS } from "./cookie-options";

// Fired on the window when the server says "slow down" (see RateLimitNotice).
export const RATE_LIMIT_EVENT = "kollokvie:rate-limited";

// A normal fetch that also notices when a request was turned away for coming
// too fast: Supabase's own limits (HTTP 429) or ours in the database
// ("Rate limit exceeded", migration 0037).
async function fetchWithRateLimitNotice(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init);
  if (!response.ok) {
    let limited = response.status === 429;
    if (!limited && response.status === 400) {
      try {
        limited = (await response.clone().text()).includes("Rate limit exceeded");
      } catch {
        // unreadable body: not a rate limit
      }
    }
    if (limited && typeof window !== "undefined") {
      window.dispatchEvent(new Event(RATE_LIMIT_EVENT));
    }
  }
  return response;
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: SESSION_COOKIE_OPTIONS,
      global: { fetch: fetchWithRateLimitNotice },
    }
  );
}
