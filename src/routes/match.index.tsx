import { createFileRoute } from "@tanstack/react-router";
import { MatchSetup } from "../components/match/MatchSetup";

export const Route = createFileRoute("/match/")({
  component: MatchSetup,
});
