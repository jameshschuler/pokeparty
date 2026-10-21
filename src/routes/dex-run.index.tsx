import { createFileRoute } from "@tanstack/react-router";
import { DexRunSetup } from "../components/dex-run/DexRunSetup";

export const Route = createFileRoute("/dex-run/")({
  component: DexRunSetup,
});
