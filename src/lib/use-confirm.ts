"use client";

import { useEffect, useRef, useState } from "react";

// Two-step tap for actions that are easy to hit by accident (unfollow, leave):
// the first tap arms the button, the second within a few seconds does it.
export function useConfirm(ms = 3000) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function ask(action: () => void) {
    clearTimeout(timer.current);
    if (armed) {
      setArmed(false);
      action();
      return;
    }
    setArmed(true);
    timer.current = setTimeout(() => setArmed(false), ms);
  }

  return { armed, ask };
}
