import { createFileRoute } from "@tanstack/react-router";
import { QuizLeaderboard } from "../components/quiz/QuizLeaderboard";
import { parseQuizSettings } from "../lib/quiz";

export const Route = createFileRoute("/quiz/leaderboard")({
  validateSearch: parseQuizSettings,
  component: QuizLeaderboard,
});
