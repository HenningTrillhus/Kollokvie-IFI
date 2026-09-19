"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const INTERVAL_MS = 30_000;
const MIN_GAP_MS = 10_000;

// Re-fetches the current page's server data (new groups, inbox items, badge
// counts) every 30s while the app is visible, and right away when you come
// back to the tab/app or regain connection. router.refresh() keeps client
// state and scroll position, so nothing jumps.
export default function AutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    let last = Date.now();

    function refresh() {
      if (document.visibilityState !== "visible" || !navigator.onLine) return;
      if (Date.now() - last < MIN_GAP_MS) return;
      last = Date.now();
      router.refresh();
    }

    const id = setInterval(refresh, INTERVAL_MS);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("online", refresh);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("online", refresh);
    };
  }, [router]);

  return null;
}
