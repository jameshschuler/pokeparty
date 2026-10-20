import { useQuizContext } from "../../contexts/quiz-context";
import { QuizChoices } from "./QuizChoices";
import { QuizHud } from "./QuizHud";
import { QuizPrompt } from "./QuizPrompt";
import { QuizQuit } from "./QuizQuit";
import { QuizSummary } from "./QuizSummary";

export function QuizGame() {
  const { round, finished } = useQuizContext();

  if (finished) {
    return <QuizSummary />;
  }

  return (
    <section className="mx-auto flex max-w-md flex-col gap-4">
      <h1 className="sr-only">Who's That Pokémon?</h1>
      <QuizQuit />
      <QuizHud />
      <QuizPrompt key={round.quiz.current.answer.id} />
      <QuizChoices />
    </section>
  );
}
