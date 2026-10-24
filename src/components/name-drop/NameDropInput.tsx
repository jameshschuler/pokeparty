import { useRef, type FormEvent, type RefObject } from "react";
import { useNameDropContext } from "../../contexts/name-drop-context";
import { diffTyping } from "../../lib/name-drop";

const SENTINEL = " ";

type NameDropInputProps = {
  inputRef: RefObject<HTMLInputElement | null>;
};

export function NameDropInput({ inputRef }: NameDropInputProps) {
  const { game, type, erase } = useNameDropContext();
  const previousRef = useRef(SENTINEL);

  function sync(input: HTMLInputElement) {
    const { erased, added } = diffTyping(previousRef.current, input.value);
    const backspacedPlaceholder = input.value === "" ? 1 : 0;
    for (let count = 0; count < erased + backspacedPlaceholder; count++) {
      erase();
    }

    if (added) {
      type(added);
    }
    previousRef.current = input.value;
  }

  function keepCaretAtEnd(input: HTMLInputElement) {
    const end = input.value.length;

    if (input.selectionStart !== end) {
      input.setSelectionRange(end, end);
    }
  }

  function reset(input: HTMLInputElement) {
    input.value = SENTINEL;
    previousRef.current = SENTINEL;
    input.setSelectionRange(1, 1);
  }

  function handleInput(event: FormEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    sync(input);

    if (!(event.nativeEvent as InputEvent).isComposing) {
      reset(input);
    }
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        aria-label="Type the Pokémon's name"
        defaultValue={SENTINEL}
        onInput={handleInput}
        onSelect={(event) => keepCaretAtEnd(event.currentTarget)}
        onCompositionEnd={(event) => {
          sync(event.currentTarget);
          reset(event.currentTarget);
        }}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        enterKeyHint="done"
        className="absolute inset-0 opacity-0"
      />
      <p
        key={game.wrongLetters}
        aria-hidden
        className={`border-ink flex min-h-11 items-center rounded-2xl border-[3px] bg-white px-4 font-mono text-lg font-bold ${game.wrongLetters > 0 ? "animate-wrong" : ""}`}
      >
        {game.typed || <span className="text-ink/40">Start typing…</span>}
      </p>
    </div>
  );
}
