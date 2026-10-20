import { createFileRoute } from "@tanstack/react-router";
import { Hub } from "../components/hub/Hub";

export const Route = createFileRoute("/")({
  component: Hub,
});
