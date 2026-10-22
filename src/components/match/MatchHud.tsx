import { useMatchContext } from "../../contexts/match-context";
import { useNow } from "../../hooks/useNow";
import {
  elapsedMs,
  formatMatchTime,
  MATCH_LEVEL_RULES,
  pairsFound,
} from "../../lib/match";
import { CLOCK_TICK_MS } from "../../lib/quiz";

export function MatchHud() {
  const { game } = useMatchContext();
  const now = useNow(CLOCK_TICK_MS, game.runningSince !== null);

  return (
    <dl className="grid grid-cols-3 gap-2 text-center">
      <div className="bg-surface rounded-2xl p-2">
        <dt className="text-ink/70 text-sm">Pairs</dt>
        <dd className="text-xl font-bold tabular-nums">
          {pairsFound(game)}/{MATCH_LEVEL_RULES[game.level].pairs}
        </dd>
      </div>
      <div className="bg-surface rounded-2xl p-2">
        <dt className="text-ink/70 text-sm">Flips</dt>
        <dd className="text-xl font-bold tabular-nums">{game.flips}</dd>
      </div>
      <div className="bg-surface rounded-2xl p-2">
        <dt className="text-ink/70 text-sm">Time</dt>
        <dd role="timer" className="text-xl font-bold tabular-nums">
          {formatMatchTime(elapsedMs(game, now))}
        </dd>
      </div>
    </dl>
  );
}
