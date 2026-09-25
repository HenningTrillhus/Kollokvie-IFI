"use client";

import { useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import DayPanel from "@/components/calendar/day-panel";
import { cardClass } from "@/components/form-ui";
import { CloseIcon } from "@/components/meta-icons";
import type { CalItem } from "@/lib/calendar-items";
import { useI18n } from "@/lib/i18n/client";

// How tall the collapsed strip (just the drag handle) is left standing.
const PEEK_HEIGHT = 40;

// The day's items as a sheet that floats over the month grid on mobile,
// instead of pushing it down the page. Drag the handle (or tap it) to peek
// at the calendar underneath without losing your place; the × closes it.
// Mount a fresh one per date (the caller passes `key={date}`), so it always
// opens fully for a newly picked day.
export default function MobileDaySheet({
  date,
  items,
  onAdd,
  onEdit,
  onDelete,
  onToggleDone,
  onClose,
}: {
  date: string;
  items: CalItem[];
  onAdd: () => void;
  onEdit: (item: CalItem) => void;
  onDelete: (item: CalItem) => void;
  onToggleDone: (item: CalItem, source: HTMLElement) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [collapsed, setCollapsed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [liveOffset, setLiveOffset] = useState(0);
  const [sheetHeight, setSheetHeight] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startY: number; startOffset: number; maxOffset: number; moved: boolean } | null>(
    null
  );

  // Re-measure whenever the rendered height might have changed (items added
  // or removed while the sheet is open). Collapsing only translates the
  // sheet, it doesn't resize it, so that alone needs no re-measure.
  useLayoutEffect(() => {
    const height = sheetRef.current?.getBoundingClientRect().height ?? 0;
    if (height) setSheetHeight(height);
  }, [items.length]);

  function liveMaxOffset() {
    const height = sheetRef.current?.getBoundingClientRect().height ?? sheetHeight;
    return Math.max(height - PEEK_HEIGHT, 0);
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      startY: e.clientY,
      startOffset: collapsed ? liveMaxOffset() : 0,
      maxOffset: liveMaxOffset(),
      moved: false,
    };
    setDragging(true);
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    // Inverted on purpose: drag up to tuck the sheet away and see more of
    // the calendar, drag down to bring it back.
    const dy = d.startY - e.clientY;
    if (Math.abs(dy) > 3) d.moved = true;
    setLiveOffset(Math.min(Math.max(d.startOffset + dy, 0), d.maxOffset));
  }

  function handlePointerUp() {
    const d = drag.current;
    if (!d) return;
    if (d.moved) {
      setCollapsed(liveOffset > d.maxOffset / 2);
    } else {
      // A tap, not a drag: just toggle.
      setCollapsed((c) => !c);
    }
    drag.current = null;
    setDragging(false);
    setLiveOffset(0);
  }

  const maxOffset = Math.max(sheetHeight - PEEK_HEIGHT, 0);
  const translateY = dragging ? liveOffset : collapsed ? maxOffset : 0;

  return (
    <div
      ref={sheetRef}
      className={`absolute inset-x-0 bottom-0 z-20 flex max-h-[65%] flex-col shadow-2xl lg:hidden ${cardClass} ${
        dragging ? "" : "transition-transform duration-300 ease-out"
      }`}
      style={{ transform: `translateY(${translateY}px)` }}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        aria-label={collapsed ? t("cal.sheetExpand") : t("cal.sheetCollapse")}
        role="button"
        className="relative flex shrink-0 cursor-grab touch-none items-center justify-center py-2.5 active:cursor-grabbing"
      >
        <span aria-hidden className="h-1 w-9 rounded-full bg-card-border" />
        <button
          type="button"
          onClick={onClose}
          aria-label={t("common.close")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted transition hover:bg-accent-soft hover:text-foreground active:scale-90"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>
      <DayPanel
        embedded
        date={date}
        items={items}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleDone={onToggleDone}
      />
    </div>
  );
}
