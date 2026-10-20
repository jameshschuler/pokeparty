import { createFileRoute } from "@tanstack/react-router";
import { QuizSetup } from "../components/quiz/QuizSetup";
import { parseQuizModeSearch } from "../lib/quiz";

export const Route = createFileRoute("/quiz/")({
  validateSearch: parseQuizModeSearch,
  component: QuizSetup,
});
