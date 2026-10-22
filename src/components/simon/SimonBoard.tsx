import { RefreshCw } from "lucide-react";
import { useRef, useState } from "react";
import { useSimonContext } from "../../contexts/simon-context";
import { useLoadTimeout } from "../../hooks/useLoadTimeout";
import { SPRITE_LOAD_TIMEOUT_MS } from "../../lib/quiz";
import { PILL_BUTTON } from "../shared/button-styles";
import { SimonPad } from "./SimonPad";
import { SIMON_BOARD_COLUMNS } from "./simon-styles";

export function SimonBoard() {
  const { game, loaded, playAgain } = useSimonContext();
  const loadedCount = useRef(0);
  const [failed, setFailed] = useState(false);
  const timedOut = useLoadTimeout(
    game.phase !== "loading" || game.onHold,
    SPRITE_LOAD_TIMEOUT_MS,
  );

  function handleSpriteLoad() {
    loadedCount.current += 1;

    if (loadedCount.current === game.board.length) {
      loaded();
    }
  }

  if (failed || timedOut) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <p className="font-semibold">Couldn't load these Pokémon.</p>
        <button type="button" onClick={playAgain} className={PILL_BUTTON}>
          <RefreshCw className="size-5" aria-hidden />
          Try other Pokémon
        </button>
      </div>
    );
  }

  return (
    <ul
      aria-label="Board"
      className={`grid gap-3 ${SIMON_BOARD_COLUMNS[game.level]}`}
    >
      {game.board.map((pokemon, index) => (
        <li key={pokemon.id}>
          <SimonPad
            index={index}
            onSpriteLoad={handleSpriteLoad}
            onSpriteError={() => setFailed(true)}
          />
        </li>
      ))}
    </ul>
  );
}
