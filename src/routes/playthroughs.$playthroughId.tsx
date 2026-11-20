import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { PlaythroughProvider } from "../contexts/playthrough-context";
import { usePlaythroughsContext } from "../contexts/playthroughs-context";

export const Route = createFileRoute("/playthroughs/$playthroughId")({
  component: PlaythroughLayout,
});

function PlaythroughLayout() {
  const { playthroughId } = Route.useParams();
  const { playthroughs } = usePlaythroughsContext();
  const playthrough = playthroughs.find((entry) => entry.id === playthroughId);

  if (!playthrough) {
    return <Navigate to="/playthroughs" replace />;
  }

  return (
    <PlaythroughProvider playthrough={playthrough}>
      <Outlet />
    </PlaythroughProvider>
  );
}
