// Persist NON-SENSITIVE UI state (the user's claimed handle, activity log) in
// localStorage. NEVER store keys, seeds, signatures, or any secret here — only public
// data the user could read on-chain anyway.
import { useCallback, useState } from "react";

export function useLocalState<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  const set = useCallback(
    (v: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next = typeof v === "function" ? (v as (prev: T) => T)(prev) : v;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          /* storage full / disabled — non-fatal */
        }
        return next;
      });
    },
    [key],
  );
  return [state, set];
}
