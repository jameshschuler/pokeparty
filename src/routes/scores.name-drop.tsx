import { createFileRoute } from "@tanstack/react-router";
import { NameDropScores } from "../components/scores/NameDropScores";

export const Route = createFileRoute("/scores/name-drop")({
  component: NameDropScores,
});
