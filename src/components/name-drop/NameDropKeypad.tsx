import { Delete } from "lucide-react";
import type { MouseEvent, PointerEvent } from "react";
import { useNameDropContext } from "../../contexts/name-drop-context";
import { NAME_DROP_KEYPAD_ROWS } from "../../lib/name-drop";
import { KEYPAD_KEY } from "./name-drop-styles";

function pressHandlers(press: () => void) {
  return {
    onPointerDown: (event: PointerEvent) => {
      if (event.button !== 0) {
        return;
      }

      event.preventDefault();
      press();
    },
    onClick: (event: MouseEvent) => {
      if (event.detail === 0) {
        press();
      }
    },
  };
}

export function NameDropKeypad() {
  const { type, erase } = useNameDropContext();

  return (
    <div
      role="group"
      aria-label="Letter pad"
      className="hidden touch-manipulation flex-col gap-1.5 select-none any-pointer-coarse:flex"
    >
      {NAME_DROP_KEYPAD_ROWS.map((row, index) => (
        <div key={row} className="flex justify-center gap-1">
          {[...row].map((letter) => (
            <button
              key={letter}
              type="button"
              className={KEYPAD_KEY}
              {...pressHandlers(() => type(letter))}
            >
              {letter.toUpperCase()}
            </button>
          ))}
          {index === NAME_DROP_KEYPAD_ROWS.length - 1 && (
            <button
              type="button"
              aria-label="Backspace"
              className={`${KEYPAD_KEY} max-w-14 flex-[1.5]`}
              {...pressHandlers(erase)}
            >
              <Delete className="size-5" aria-hidden />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
