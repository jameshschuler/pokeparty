import { useSimonContext } from "../../contexts/simon-context";
import { formatPokemonLabel } from "../../lib/pokemon";
import {
  completedLength,
  describeSimonStatus,
  litIndex,
} from "../../lib/simon";

export function SimonStatus() {
  const { game } = useSimonContext();
  const lit = litIndex(game);

  return (
    <div className="flex items-center justify-between gap-3 text-lg font-bold">
      <p aria-live="polite">{describeSimonStatus(game)}</p>
      <p aria-label="Score" className="tabular-nums">
        {completedLength(game)}
      </p>
      <p className="sr-only" aria-live="assertive">
        {lit === null
          ? ""
          : `${game.step + 1}: ${formatPokemonLabel(game.board[lit])}`}
      </p>
    </div>
  );
}
