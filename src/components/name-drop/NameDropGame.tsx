import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { useRef } from "react";
import { useNameDropContext } from "../../contexts/name-drop-context";
import { useSpaceBelow } from "../../hooks/useSpaceBelow";
import { useTypingKeys } from "../../hooks/useTypingKeys";
import { QuitRound } from "../game/QuitRound";
import { PRIMARY_BUTTON, SECONDARY_BUTTON } from "../shared/button-styles";
import { NameDropAnnouncer } from "./NameDropAnnouncer";
import { NameDropField } from "./NameDropField";
import { NameDropHud } from "./NameDropHud";
import { NameDropKeypad } from "./NameDropKeypad";
import { NameDropSummary } from "./NameDropSummary";
import { NameDropTyped } from "./NameDropTyped";

const BOTTOM_MARGIN_PX = 16;

export function NameDropGame() {
  const { game, start, type, erase, hold, release } = useNameDropContext();
  const playAreaRef = useRef<HTMLDivElement>(null);
  const height = useSpaceBelow(playAreaRef, BOTTOM_MARGIN_PX);
  useTypingKeys({ onLetter: type, onBackspace: erase });

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
      <div
        ref={playAreaRef}
        className="flex flex-col gap-3"
        style={{ minHeight: height }}
      >
        <NameDropField>
          {game.phase === "ready" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button type="button" onClick={start} className={PRIMARY_BUTTON}>
                <Play className="size-5" aria-hidden />
                Start
              </button>
            </div>
          )}
        </NameDropField>
        <NameDropTyped />
        <NameDropKeypad />
      </div>
      <NameDropAnnouncer />
    </section>
  );
}
