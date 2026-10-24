import { Heart } from "lucide-react";
import { useNameDropContext } from "../../contexts/name-drop-context";
import { multiplier, NAME_DROP_LIVES } from "../../lib/name-drop";

export function NameDropHud() {
  const { game } = useNameDropContext();

  return (
    <div className="flex items-center justify-between gap-3 text-lg font-bold">
      <p>
        Score{" "}
        <span aria-label="Score" className="tabular-nums">
          {game.score}
        </span>
      </p>
      <p aria-label="Multiplier" className="text-primary tabular-nums">
        ×{multiplier(game.combo)}
      </p>
      <span
        role="img"
        aria-label={`${game.lives} of ${NAME_DROP_LIVES} lives left`}
        className="flex gap-1"
      >
        {Array.from({ length: NAME_DROP_LIVES }, (_, life) => (
          <Heart
            key={life}
            aria-hidden
            className={`size-5 ${life < game.lives ? "fill-wrong text-wrong" : "text-ink/30"}`}
          />
        ))}
      </span>
    </div>
  );
}
