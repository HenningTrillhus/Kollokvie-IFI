import type { ReactNode } from "react";

// Content that slides open and closed (height and fade). While closed it is
// `inert`, so keyboard focus and screen readers skip it.
export default function Collapsible({
  open,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) {
  return (
    <div
      inert={!open}
      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}
    >
      {/* The padding and negative margin keep focus rings from being clipped. */}
      <div className="-m-1 min-h-0 overflow-hidden p-1">{children}</div>
    </div>
  );
}
