import { createFileRoute } from "@tanstack/react-router";
import { PlaythroughView } from "../components/playthroughs/PlaythroughView";

export const Route = createFileRoute("/playthroughs/$playthroughId/")({
  component: PlaythroughView,
});
