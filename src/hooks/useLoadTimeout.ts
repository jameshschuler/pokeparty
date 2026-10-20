import { useEffect, useState } from "react";

export function useLoadTimeout(loaded: boolean, timeoutMs: number): boolean {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (loaded) {
      return;
    }

    const timeout = setTimeout(() => setTimedOut(true), timeoutMs);

    return () => clearTimeout(timeout);
  }, [loaded, timeoutMs]);

  return timedOut && !loaded;
}
