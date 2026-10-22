import { createFileRoute } from "@tanstack/react-router";
import { SimonScores } from "../components/scores/SimonScores";
import { parseSimonLevelSearch } from "../lib/simon";

export const Route = createFileRoute("/scores/simon")({
  validateSearch: parseSimonLevelSearch,
  component: SimonScores,
});
