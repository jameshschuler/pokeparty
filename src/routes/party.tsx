import { createFileRoute } from "@tanstack/react-router";
import { TeamList } from "../components/teams/TeamList";

export const Route = createFileRoute("/party")({
  component: TeamList,
});
