"use client";

import { useRef, useState, type ReactNode } from "react";

type Tab = { label: string; count?: number; content: ReactNode };

// Tabs whose panes you can swipe between (scroll-snap) or tap. Each pane is
// its own scroll box, so long lists don't stretch the whole page.
export default function SwipeTabs({ tabs }: { tabs: Tab[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function handleScroll() {
    const el = scroller.current;
    if (!el || el.clientWidth === 0) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  }

  function goTo(index: number) {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div>
      <div role="tablist" className="flex border-b border-card-border">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            role="tab"
            aria-selected={active === i}
            onClick={() => goTo(i)}
            className={`relative flex-1 px-3 py-2.5 text-sm font-medium transition active:opacity-70 ${
              active === i ? "text-foreground" : "text-muted"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 text-xs text-muted">{tab.count}</span>
            )}
            {active === i && (
              <span className="absolute inset-x-6 -bottom-px h-0.5 rounded-full bg-accent" />
            )}
          </button>
        ))}
      </div>

      <div
        ref={scroller}
        onScroll={handleScroll}
        className="no-scrollbar mt-4 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {tabs.map((tab) => (
          <div key={tab.label} className="w-full shrink-0 snap-start snap-always">
            <div className="max-h-80 overflow-y-auto overscroll-contain">
              {tab.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
