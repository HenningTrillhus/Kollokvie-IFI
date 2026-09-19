"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

// The page itself never scrolls: header and tab bar stay put and only <main>
// scrolls, like a native app. Because the scroll container isn't the window,
// Next's scroll-to-top on navigation doesn't reach it, so reset it manually.
export default function AppShell({
  header,
  bottom,
  children,
}: {
  header: ReactNode;
  bottom: ReactNode;
  children: ReactNode;
}) {
  const scroller = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [pathname]);

  // iOS Safari ignores user-scalable=no; block its pinch-zoom gesture directly.
  useEffect(() => {
    const block = (e: Event) => e.preventDefault();
    document.addEventListener("gesturestart", block);
    document.addEventListener("gesturechange", block);
    return () => {
      document.removeEventListener("gesturestart", block);
      document.removeEventListener("gesturechange", block);
    };
  }, []);

  return (
    <div className="app-shell fixed inset-0 flex flex-col overflow-hidden">
      {header}
      <main
        ref={scroller}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-contain"
      >
        <div key={pathname} className="flex flex-1 flex-col animate-fade-in">
          {children}
        </div>
      </main>
      {bottom}
    </div>
  );
}
