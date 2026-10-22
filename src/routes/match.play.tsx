import { createFileRoute } from "@tanstack/react-router";
import { MatchGame } from "../components/match/MatchGame";
import { MatchProvider } from "../contexts/match-context";
import { parseMatchLevelSearch } from "../lib/match";

export const Route = createFileRoute("/match/play")({
  validateSearch: parseMatchLevelSearch,
  component: MatchRoute,
});

function MatchRoute() {
  const { level } = Route.useSearch();

  return (
    <MatchProvider key={level} level={level}>
      <MatchGame />
    </MatchProvider>
  );
}
