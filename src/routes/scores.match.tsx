import { createFileRoute } from "@tanstack/react-router";
import { MatchScores } from "../components/scores/MatchScores";
import { parseMatchLevelSearch } from "../lib/match";

export const Route = createFileRoute("/scores/match")({
  validateSearch: parseMatchLevelSearch,
  component: MatchScores,
});
