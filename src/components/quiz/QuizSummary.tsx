import { Link } from "@tanstack/react-router";
import { RotateCcw, Share2, Timer } from "lucide-react";
import { useQuizContext } from "../../contexts/quiz-context";
import { roundResult } from "../../lib/quiz-result";
import { PILL_BUTTON, PRIMARY_BUTTON } from "../shared/button-styles";
import { QuizScore } from "./QuizScore";

export function QuizSummary() {
  const { round, mode, playAgain } = useQuizContext();
  const result = roundResult(round);

  return (
    <section className="border-ink shadow-sticker flex flex-col items-center gap-4 rounded-3xl border-[3px] bg-white p-6 text-center">
      <h1 className="text-3xl font-bold">Time's up!</h1>
      <QuizScore result={result} />
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={playAgain} className={PRIMARY_BUTTON}>
          <RotateCcw className="size-5" aria-hidden />
          Play again
        </button>
        <Link
          to="/quiz"
          search={{ mode }}
          className="border-ink shadow-sticker-sm flex min-h-12 items-center gap-2 rounded-2xl border-[3px] bg-white px-5 text-lg font-semibold"
        >
          <Timer className="size-5" aria-hidden />
          Change setup
        </Link>
      </div>
      <Link to="/quiz/result" search={result} className={PILL_BUTTON}>
        <Share2 className="size-5" aria-hidden />
        Share result
      </Link>
    </section>
  );
}
