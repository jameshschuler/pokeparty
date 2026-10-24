import { useEffect, useRef } from "react";

type TypingKeys = {
  onLetter: (letter: string) => void;
  onBackspace: () => void;
};

export function useTypingKeys(keys: TypingKeys) {
  const keysRef = useRef(keys);

  useEffect(() => {
    keysRef.current = keys;
  });

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      if (event.key === "Backspace") {
        keysRef.current.onBackspace();
      } else if (event.key.length === 1 && !event.repeat) {
        keysRef.current.onLetter(event.key);
      }
    }
    window.addEventListener("keydown", handleKey);

    return () => window.removeEventListener("keydown", handleKey);
  }, []);
}
