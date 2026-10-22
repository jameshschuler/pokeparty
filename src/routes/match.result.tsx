import { createFileRoute } from "@tanstack/react-router";
import { MatchResultCard } from "../components/match/MatchResultCard";
import { parseMatchResult, type MatchResult } from "../lib/match-result";

export const Route = createFileRoute("/match/result")({
  validateSearch: (search): Partial<MatchResult> =>
    parseMatchResult(search) ?? {},
  component: MatchResultRoute,
});

function MatchResultRoute() {
  const result = parseMatchResult(Route.useSearch());

  return <MatchResultCard result={result} />;
}
