import { useSimonContext } from "../../contexts/simon-context";
import { useBoardSprites } from "../../hooks/useBoardSprites";
import { SpriteLoadFailed } from "../game/SpriteLoadFailed";
import { SimonPad } from "./SimonPad";
import { SIMON_BOARD_COLUMNS } from "./simon-styles";

export function SimonBoard() {
  const { game, loaded, playAgain } = useSimonContext();
  const sprites = useBoardSprites(
    game.board.length,
    game.phase === "loading" && !game.onHold,
    loaded,
  );

  if (sprites.failed) {
    return <SpriteLoadFailed onRetry={playAgain} />;
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
            onSpriteLoad={sprites.handleLoad}
            onSpriteError={sprites.handleError}
          />
        </li>
      ))}
    </ul>
  );
}
