import { createFileRoute } from "@tanstack/react-router";
import { QuizSetup } from "../components/quiz/QuizSetup";

export const Route = createFileRoute("/quiz/")({
  component: QuizSetup,
});
