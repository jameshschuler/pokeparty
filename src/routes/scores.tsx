import { createFileRoute } from "@tanstack/react-router";
import { ScoresLayout } from "../components/scores/ScoresLayout";

export const Route = createFileRoute("/scores")({
  component: ScoresLayout,
});
