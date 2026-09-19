"use client";

import { useRef, useState, type ReactNode } from "react";
import { cardClass } from "@/components/form-ui";

type Tab = { label: string; count?: number; content: ReactNode };

// A card with tabs whose panes you can swipe between (scroll-snap) or tap.
// Each pane is its own scroll box, so long lists don't stretch the whole page.
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
    <div className={`overflow-hidden ${cardClass}`}>
      <div role="tablist" className="relative flex border-b border-card-border">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            role="tab"
            aria-selected={active === i}
            onClick={() => goTo(i)}
            className={`flex-1 px-3 py-3 text-sm font-medium transition active:opacity-70 ${
              active === i ? "text-foreground" : "text-muted"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 text-xs text-muted">{tab.count}</span>
            )}
          </button>
        ))}
        {/* One indicator that slides between the tabs */}
        <span
          aria-hidden
          className="absolute -bottom-px left-0 h-0.5 transition-transform duration-300 ease-out"
          style={{
            width: `${100 / tabs.length}%`,
            transform: `translateX(${active * 100}%)`,
          }}
        >
          <span className="mx-auto block h-full w-2/5 rounded-full bg-accent" />
        </span>
      </div>

      <div
        ref={scroller}
        onScroll={handleScroll}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {tabs.map((tab) => (
          <div key={tab.label} className="w-full shrink-0 snap-start snap-always">
            <div className="max-h-80 overflow-y-auto overscroll-contain p-2">
              {tab.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
