import { createFileRoute } from "@tanstack/react-router";
import { QuizScores } from "../components/scores/QuizScores";
import { parseQuizSettings } from "../lib/quiz";

export const Route = createFileRoute("/scores/quiz")({
  validateSearch: parseQuizSettings,
  component: QuizScores,
});
