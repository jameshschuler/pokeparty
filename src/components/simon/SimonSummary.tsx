import { Link } from "@tanstack/react-router";
import { Grid3x3, RotateCcw, Share2, Trophy } from "lucide-react";
import { useLeaderboardContext } from "../../contexts/leaderboard-context";
import { useSimonContext } from "../../contexts/simon-context";
import { unlockCries } from "../../lib/audio";
import { runRank, simonScore } from "../../lib/leaderboard";
import { simonResult } from "../../lib/simon-result";
import { RankBadge } from "../game/RankBadge";
import {
  PILL_BUTTON,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
} from "../shared/button-styles";
import { MainMenuLink } from "../shared/MainMenuLink";
import { SimonScoreCard } from "./SimonScoreCard";

export function SimonSummary() {
  const { game, playAgain } = useSimonContext();
  const { runs } = useLeaderboardContext();
  const result = simonResult(game);
  const rank = runRank(runs, simonScore(game));

  return (
    <section className="border-ink shadow-sticker flex flex-col items-center gap-4 rounded-3xl border-[3px] bg-white p-6 text-center">
      <h1 className="text-3xl font-bold">Game over!</h1>
      <RankBadge rank={rank} />
      <SimonScoreCard result={result} />
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            unlockCries();
            playAgain();
          }}
          className={PRIMARY_BUTTON}
        >
          <RotateCcw className="size-5" aria-hidden />
          Play again
        </button>
        <Link to="/simon" className={SECONDARY_BUTTON}>
          <Grid3x3 className="size-5" aria-hidden />
          Change level
        </Link>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link to="/simon/result" search={result} className={PILL_BUTTON}>
          <Share2 className="size-5" aria-hidden />
          Share result
        </Link>
        <Link
          to="/scores/simon"
          search={{ level: game.level }}
          className={PILL_BUTTON}
        >
          <Trophy className="size-5" aria-hidden />
          Your scores
        </Link>
        <MainMenuLink />
      </div>
    </section>
  );
}
