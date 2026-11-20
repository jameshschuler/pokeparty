import { createFileRoute } from "@tanstack/react-router";
import { NewPlaythrough } from "../components/playthroughs/NewPlaythrough";

export const Route = createFileRoute("/playthroughs/new")({
  component: NewPlaythrough,
});
