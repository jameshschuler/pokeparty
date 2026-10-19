import { createFileRoute } from "@tanstack/react-router";
import { SharedTeam } from "../components/share/SharedTeam";
import { parseSharedTeam } from "../lib/share";

export const Route = createFileRoute("/share")({
  validateSearch: (search: Record<string, unknown>) => ({
    team: parseSharedTeam(String(search.team ?? "")),
  }),
  component: ShareRoute,
});

function ShareRoute() {
  const { team } = Route.useSearch();
  return <SharedTeam pokemonIds={team} />;
}
