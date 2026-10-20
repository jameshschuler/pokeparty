import { createFileRoute } from "@tanstack/react-router";
import { QuizResultCard } from "../components/quiz/QuizResultCard";
import { parseQuizResult, type QuizResult } from "../lib/quiz-result";

export const Route = createFileRoute("/quiz/result")({
  validateSearch: (search): Partial<QuizResult> =>
    parseQuizResult(search) ?? {},
  component: QuizResultRoute,
});

function QuizResultRoute() {
  const result = parseQuizResult(Route.useSearch());

  return <QuizResultCard result={result} />;
}
