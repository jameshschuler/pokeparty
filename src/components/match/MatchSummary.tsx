import { Link } from "@tanstack/react-router";
import { Grid2x2, RotateCcw, Share2, Trophy } from "lucide-react";
import { useLeaderboardContext } from "../../contexts/leaderboard-context";
import { useMatchContext } from "../../contexts/match-context";
import { matchScore, runRank } from "../../lib/leaderboard";
import { matchResult } from "../../lib/match-result";
import { RankBadge } from "../game/RankBadge";
import {
  PILL_BUTTON,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
} from "../shared/button-styles";
import { EndScreen } from "../shared/EndScreen";
import { MatchScoreCard } from "./MatchScoreCard";

export function MatchSummary() {
  const { game, playAgain } = useMatchContext();
  const { runs } = useLeaderboardContext();
  const result = matchResult(game);
  const rank = runRank(runs, matchScore(game));

  return (
    <EndScreen>
      <section className="border-ink shadow-sticker flex flex-col items-center gap-4 rounded-3xl border-[3px] bg-white p-6 text-center">
        <h1 className="text-3xl font-bold">All pairs found!</h1>
        <RankBadge rank={rank} />
        <MatchScoreCard result={result} />
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={playAgain} className={PRIMARY_BUTTON}>
            <RotateCcw className="size-5" aria-hidden />
            Play again
          </button>
          <Link to="/match" className={SECONDARY_BUTTON}>
            <Grid2x2 className="size-5" aria-hidden />
            Change level
          </Link>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/match/result" search={result} className={PILL_BUTTON}>
            <Share2 className="size-5" aria-hidden />
            Share result
          </Link>
          <Link
            to="/scores/match"
            search={{ level: game.level }}
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
