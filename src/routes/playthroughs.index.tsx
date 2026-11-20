import { createFileRoute } from "@tanstack/react-router";
import { PlaythroughList } from "../components/playthroughs/PlaythroughList";

export const Route = createFileRoute("/playthroughs/")({
  component: PlaythroughList,
});
