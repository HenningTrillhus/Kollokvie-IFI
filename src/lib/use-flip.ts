"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";

// Smoothly slides items to their new place when a list is reordered.
// Mark each item with `data-flip="<stable key>"`; when the order changes,
// every item that moved animates from where it was to where it is now.
export function useFlip(container: RefObject<HTMLElement | null>, duration = 450) {
  const previous = useRef(new Map<string, { x: number; y: number }>());

  useLayoutEffect(() => {
    const el = container.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const box = el.getBoundingClientRect();
    const next = new Map<string, { x: number; y: number }>();

    el.querySelectorAll<HTMLElement>("[data-flip]").forEach((node) => {
      const key = node.dataset.flip as string;
      const r = node.getBoundingClientRect();
      // Positions inside the container, so scrolling doesn't count as movement.
      const pos = { x: r.left - box.left + el.scrollLeft, y: r.top - box.top + el.scrollTop };
      next.set(key, pos);

      const before = previous.current.get(key);
      if (!before || reduced) return;
      const dx = before.x - pos.x;
      const dy = before.y - pos.y;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      node.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }],
        { duration, easing: "cubic-bezier(0.32, 0.72, 0, 1)" }
      );
    });

    previous.current = next;
  });
}
