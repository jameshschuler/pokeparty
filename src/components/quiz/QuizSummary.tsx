import { Link } from "@tanstack/react-router";
import { RotateCcw, Share2, Timer, Trophy } from "lucide-react";
import { useLeaderboardContext } from "../../contexts/leaderboard-context";
import { useQuizContext } from "../../contexts/quiz-context";
import { roundRun, runRank } from "../../lib/leaderboard";
import { roundResult } from "../../lib/quiz-result";
import {
  PILL_BUTTON,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
} from "../shared/button-styles";
import { RankBadge } from "../game/RankBadge";
import { QuizScore } from "./QuizScore";

export function QuizSummary() {
  const { round, mode, playAgain } = useQuizContext();
  const { runs } = useLeaderboardContext();
  const result = roundResult(round);
  const rank = runRank(runs, roundRun(round));

  return (
    <section className="border-ink shadow-sticker flex flex-col items-center gap-4 rounded-3xl border-[3px] bg-white p-6 text-center">
      <h1 className="text-3xl font-bold">Time's up!</h1>
      <RankBadge rank={rank} />
      <QuizScore result={result} />
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={playAgain} className={PRIMARY_BUTTON}>
          <RotateCcw className="size-5" aria-hidden />
          Play again
        </button>
        <Link to="/quiz" search={{ mode }} className={SECONDARY_BUTTON}>
          <Timer className="size-5" aria-hidden />
          Change setup
        </Link>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link to="/quiz/result" search={result} className={PILL_BUTTON}>
          <Share2 className="size-5" aria-hidden />
          Share result
        </Link>
        <Link
          to="/scores/quiz"
          search={{ mode, clock: result.clock }}
          className={PILL_BUTTON}
        >
          <Trophy className="size-5" aria-hidden />
          Your scores
        </Link>
      </div>
    </section>
  );
}
