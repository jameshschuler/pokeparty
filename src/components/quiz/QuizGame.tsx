import { Link } from "@tanstack/react-router";
import { useQuizContext } from "../../contexts/quiz-context";
import { useRoundContext } from "../../contexts/round-context";
import { ChoiceGrid } from "../game/ChoiceGrid";
import { QuitRound } from "../game/QuitRound";
import { SECONDARY_BUTTON } from "../shared/button-styles";
import { QuizHud } from "./QuizHud";
import { QuizPrompt } from "./QuizPrompt";
import { QuizSummary } from "./QuizSummary";

export function QuizGame() {
  const { round, mode, finished } = useQuizContext();
  const { hold, release } = useRoundContext();

  if (finished) {
    return <QuizSummary />;
  }

  return (
    <section className="mx-auto flex max-w-md flex-col gap-4">
      <h1 className="sr-only">Who's That Pokémon?</h1>
      <QuitRound
        hold={hold}
        release={release}
        exit={
          <Link to="/quiz" search={{ mode }} className={SECONDARY_BUTTON}>
            Quit
          </Link>
        }
      />
      <QuizHud />
      <QuizPrompt key={`prompt-${round.quiz.questionNumber}`} />
      <ChoiceGrid key={`choices-${round.quiz.questionNumber}`} />
    </section>
  );
}
