import { createFileRoute, Navigate } from "@tanstack/react-router";
import { TeamBuilder } from "../components/builder/TeamBuilder";
import { TeamBuilderProvider } from "../contexts/team-builder-context";
import { useTeamsContext } from "../contexts/teams-context";
import { NEW_TEAM_ID } from "../lib/team";

export const Route = createFileRoute("/team/$teamId")({
  component: TeamRoute,
});

function TeamRoute() {
  const { teamId } = Route.useParams();
  const { teams } = useTeamsContext();
  const exists = teams.some((team) => team.id === teamId);

  if (!exists && teamId !== NEW_TEAM_ID) {
    return <Navigate to="/party" replace />;
  }
  return (
    <TeamBuilderProvider teamId={teamId}>
      <TeamBuilder />
    </TeamBuilderProvider>
  );
}
