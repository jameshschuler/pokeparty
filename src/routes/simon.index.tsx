import { createFileRoute } from "@tanstack/react-router";
import { SimonSetup } from "../components/simon/SimonSetup";

export const Route = createFileRoute("/simon/")({
  component: SimonSetup,
});
