import { useMatchContext } from "../../contexts/match-context";
import { useBoardSprites } from "../../hooks/useBoardSprites";
import { SpriteLoadFailed } from "../game/SpriteLoadFailed";
import { MatchCard } from "./MatchCard";
import { MATCH_BOARD_COLUMNS } from "./match-styles";

export function MatchBoard() {
  const { game, loaded, playAgain } = useMatchContext();
  const sprites = useBoardSprites(
    game.cards.length,
    game.phase === "loading" && !game.onHold,
    loaded,
  );

  if (sprites.failed) {
    return <SpriteLoadFailed onRetry={playAgain} />;
  }

  return (
    <ul
      aria-label="Cards"
      className={`grid gap-2 sm:gap-3 ${MATCH_BOARD_COLUMNS[game.level]}`}
    >
      {game.cards.map((pokemon, index) => (
        <li key={`${pokemon.id}-${index}`}>
          <MatchCard
            index={index}
            onSpriteLoad={sprites.handleLoad}
            onSpriteError={sprites.handleError}
          />
        </li>
      ))}
    </ul>
  );
}
