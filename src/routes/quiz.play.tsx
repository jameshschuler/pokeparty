import { createFileRoute } from "@tanstack/react-router";
import { QuizGame } from "../components/quiz/QuizGame";
import { QuizProvider } from "../contexts/quiz-context";
import { DEFAULT_ROUND_SECONDS, isRoundSeconds } from "../lib/quiz";

export const Route = createFileRoute("/quiz/play")({
  validateSearch: (search: Record<string, unknown>) => {
    const seconds = Number(search.seconds);

    return {
      seconds: isRoundSeconds(seconds) ? seconds : DEFAULT_ROUND_SECONDS,
    };
  },
  component: QuizRoute,
});

function QuizRoute() {
  const { seconds } = Route.useSearch();

  return (
    <QuizProvider key={seconds} seconds={seconds}>
      <QuizGame />
    </QuizProvider>
  );
}
