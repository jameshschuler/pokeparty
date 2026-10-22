import { useRef, useState } from "react";
import { SPRITE_LOAD_TIMEOUT_MS } from "../lib/quiz";
import { useLoadTimeout } from "./useLoadTimeout";

type BoardSprites = {
  failed: boolean;
  handleLoad: () => void;
  handleError: () => void;
};

export function useBoardSprites(
  count: number,
  waiting: boolean,
  onLoaded: () => void,
): BoardSprites {
  const loadedCount = useRef(0);
  const [errored, setErrored] = useState(false);
  const timedOut = useLoadTimeout(!waiting, SPRITE_LOAD_TIMEOUT_MS);

  function handleLoad() {
    loadedCount.current += 1;

    if (loadedCount.current === count) {
      onLoaded();
    }
  }

  return {
    failed: errored || timedOut,
    handleLoad,
    handleError: () => setErrored(true),
  };
}
