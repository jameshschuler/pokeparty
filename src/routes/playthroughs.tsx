import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PlaythroughsProvider } from "../contexts/playthroughs-context";

export const Route = createFileRoute("/playthroughs")({
  component: PlaythroughsLayout,
});

function PlaythroughsLayout() {
  return (
    <PlaythroughsProvider>
      <Outlet />
    </PlaythroughsProvider>
  );
}
