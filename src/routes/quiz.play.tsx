import { createFileRoute } from "@tanstack/react-router";
import { QuizGame } from "../components/quiz/QuizGame";
import { QuizProvider } from "../contexts/quiz-context";
import { parseQuizSettings } from "../lib/quiz";

export const Route = createFileRoute("/quiz/play")({
  validateSearch: parseQuizSettings,
  component: QuizRoute,
});

function QuizRoute() {
  const { mode, clock } = Route.useSearch();

  return (
    <QuizProvider key={`${mode}-${clock}`} mode={mode} clock={clock}>
      <QuizGame />
    </QuizProvider>
  );
}
