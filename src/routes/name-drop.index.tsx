import { createFileRoute } from "@tanstack/react-router";
import { NameDropSetup } from "../components/name-drop/NameDropSetup";

export const Route = createFileRoute("/name-drop/")({
  component: NameDropSetup,
});
