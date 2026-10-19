import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { SharedTeam } from "../components/share/SharedTeam";
import { parseSharedTeam } from "../lib/share";

export const Route = createFileRoute("/share")({
  validateSearch: (search: Record<string, unknown>) => ({
    team: String(search.team ?? ""),
  }),
  component: ShareRoute,
});

function ShareRoute() {
  const { team } = Route.useSearch();
  const members = useMemo(() => parseSharedTeam(team), [team]);
  return <SharedTeam members={members} />;
}
