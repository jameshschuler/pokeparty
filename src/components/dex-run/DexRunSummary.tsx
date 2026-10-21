import { Link } from "@tanstack/react-router";
import { ListOrdered, RotateCcw } from "lucide-react";
import { useDexRunContext } from "../../contexts/dex-run-context";
import { useLeaderboardContext } from "../../contexts/leaderboard-context";
import { clearedRange, formatDexRange, reachedNumber } from "../../lib/dex-run";
import { dexRunScore, runRank } from "../../lib/leaderboard";
import { formatPokemonNumber } from "../../lib/pokemon";
import { PRIMARY_BUTTON, SECONDARY_BUTTON } from "../shared/button-styles";
import { RankBadge } from "../game/RankBadge";

export function DexRunSummary() {
  const { run, playAgain } = useDexRunContext();
  const { runs } = useLeaderboardContext();
  const rank = runRank(runs, dexRunScore(run));

  return (
    <section className="border-ink shadow-sticker flex flex-col items-center gap-4 rounded-3xl border-[3px] bg-white p-6 text-center">
      <h1 className="text-3xl font-bold">
        {clearedRange(run) ? "Cleared!" : "Out of lives!"}
      </h1>
      <RankBadge rank={rank} />
      <p>
        <span className="text-primary block text-6xl font-bold">
          {run.correct}
        </span>
        named · {formatDexRange(run.range)}
      </p>
      <p className="bg-surface rounded-2xl px-4 py-2 font-semibold">
        Reached {formatPokemonNumber(reachedNumber(run))} of{" "}
        {formatPokemonNumber(run.pool.at(-1)!.speciesId)}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={playAgain} className={PRIMARY_BUTTON}>
          <RotateCcw className="size-5" aria-hidden />
          Play again
        </button>
        <Link to="/dex-run" className={SECONDARY_BUTTON}>
          <ListOrdered className="size-5" aria-hidden />
          Change dex
        </Link>
      </div>
    </section>
  );
}
