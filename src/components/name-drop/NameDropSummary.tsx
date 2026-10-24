import { Link } from "@tanstack/react-router";
import { RotateCcw, Share2, Trophy } from "lucide-react";
import { useLeaderboardContext } from "../../contexts/leaderboard-context";
import { useNameDropContext } from "../../contexts/name-drop-context";
import { nameDropScore, runRank } from "../../lib/leaderboard";
import { nameDropResult } from "../../lib/name-drop-result";
import { RankBadge } from "../game/RankBadge";
import { PILL_BUTTON, PRIMARY_BUTTON } from "../shared/button-styles";
import { EndScreen } from "../shared/EndScreen";
import { NameDropScoreCard } from "./NameDropScoreCard";

export function NameDropSummary() {
  const { game, playAgain } = useNameDropContext();
  const { runs } = useLeaderboardContext();
  const result = nameDropResult(game);
  const rank = runRank(runs, nameDropScore(game));

  return (
    <EndScreen>
      <section className="border-ink shadow-sticker flex flex-col items-center gap-4 rounded-3xl border-[3px] bg-white p-6 text-center">
        <h1 className="text-3xl font-bold">Game over!</h1>
        <RankBadge rank={rank} />
        <NameDropScoreCard result={result} />
        <p className="text-ink/70">Best combo {game.bestCombo}</p>
        <button type="button" onClick={playAgain} className={PRIMARY_BUTTON}>
          <RotateCcw className="size-5" aria-hidden />
          Play again
        </button>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/name-drop/result" search={result} className={PILL_BUTTON}>
            <Share2 className="size-5" aria-hidden />
            Share result
          </Link>
          <Link to="/scores/name-drop" className={PILL_BUTTON}>
            <Trophy className="size-5" aria-hidden />
            Your scores
          </Link>
        </div>
      </section>
    </EndScreen>
  );
}
