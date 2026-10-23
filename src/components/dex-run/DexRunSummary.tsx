import { Link } from "@tanstack/react-router";
import { ListOrdered, RotateCcw, Share2, Trophy } from "lucide-react";
import { useDexRunContext } from "../../contexts/dex-run-context";
import { useLeaderboardContext } from "../../contexts/leaderboard-context";
import { clearedResult, dexRunResult } from "../../lib/dex-run-result";
import { dexRunScore, runRank } from "../../lib/leaderboard";
import {
  PILL_BUTTON,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
} from "../shared/button-styles";
import { EndScreen } from "../shared/EndScreen";
import { RankBadge } from "../game/RankBadge";
import { DexRunScoreCard } from "./DexRunScoreCard";

export function DexRunSummary() {
  const { run, playAgain } = useDexRunContext();
  const { runs } = useLeaderboardContext();
  const result = dexRunResult(run);
  const rank = runRank(runs, dexRunScore(run));

  return (
    <EndScreen>
      <section className="border-ink shadow-sticker flex flex-col items-center gap-4 rounded-3xl border-[3px] bg-white p-6 text-center">
        <h1 className="text-3xl font-bold">
          {clearedResult(result) ? "Cleared!" : "Out of lives!"}
        </h1>
        <RankBadge rank={rank} />
        <DexRunScoreCard result={result} />
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
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/dex-run/result" search={result} className={PILL_BUTTON}>
            <Share2 className="size-5" aria-hidden />
            Share result
          </Link>
          <Link
            to="/scores/dex-run"
            search={{ range: run.range }}
            className={PILL_BUTTON}
          >
            <Trophy className="size-5" aria-hidden />
            Your scores
          </Link>
        </div>
      </section>
    </EndScreen>
  );
}
