import { Link } from "@tanstack/react-router";
import { Keyboard } from "lucide-react";
import { useRef } from "react";
import { useNameDropContext } from "../../contexts/name-drop-context";
import { QuitRound } from "../game/QuitRound";
import { PRIMARY_BUTTON, SECONDARY_BUTTON } from "../shared/button-styles";
import { NameDropAnnouncer } from "./NameDropAnnouncer";
import { NameDropField } from "./NameDropField";
import { NameDropHud } from "./NameDropHud";
import { NameDropInput } from "./NameDropInput";
import { NameDropSummary } from "./NameDropSummary";

export function NameDropGame() {
  const { game, start, hold, release } = useNameDropContext();
  const inputRef = useRef<HTMLInputElement>(null);

  function focusInput() {
    inputRef.current?.focus();
  }

  if (game.finished) {
    return <NameDropSummary />;
  }

  return (
    <section className="mx-auto flex max-w-md flex-col gap-3">
      <h1 className="sr-only">Name Drop</h1>
      <QuitRound
        hold={hold}
        release={release}
        exit={
          <Link to="/name-drop" className={SECONDARY_BUTTON}>
            Quit
          </Link>
        }
      />
      <NameDropHud />
      <NameDropInput inputRef={inputRef} />
      <NameDropField onTap={focusInput}>
        {game.phase === "ready" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                focusInput();
                start();
              }}
              className={PRIMARY_BUTTON}
            >
              <Keyboard className="size-5" aria-hidden />
              Tap to start
            </button>
          </div>
        )}
      </NameDropField>
      <NameDropAnnouncer />
    </section>
  );
}
