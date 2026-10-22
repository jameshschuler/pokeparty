import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { DEFAULT_QUIZ_MODE } from "../../lib/quiz";
import { quizResultUrl, type QuizResult } from "../../lib/quiz-result";
import { MissingResult } from "../share/MissingResult";
import { ResultCard } from "../share/ResultCard";
import { PRIMARY_BUTTON } from "../shared/button-styles";
import { QuizScore } from "./QuizScore";

export function QuizResultCard({ result }: { result: QuizResult | null }) {
  if (!result) {
    return (
      <MissingResult
        playLink={
          <Link
            to="/quiz"
            search={{ mode: DEFAULT_QUIZ_MODE }}
            className={PRIMARY_BUTTON}
          >
            Play Who's That Pokémon?
          </Link>
        }
      />
    );
  }

  return (
    <ResultCard
      title="Who's That Pokémon?"
      url={quizResultUrl(result, window.location.origin)}
      shareTitle="Can you beat my score?"
      playLink={
        <Link
          to="/quiz/play"
          search={{ mode: result.mode, clock: result.clock }}
          className={PRIMARY_BUTTON}
        >
          <Play className="size-5" aria-hidden />
          Play this mode
        </Link>
      }
    >
      <QuizScore result={result} />
    </ResultCard>
  );
}
