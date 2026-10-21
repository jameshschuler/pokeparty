import { createFileRoute } from "@tanstack/react-router";
import { DexRunScores } from "../components/scores/DexRunScores";
import { parseDexRangeSearch } from "../lib/dex-run";

export const Route = createFileRoute("/scores/dex-run")({
  validateSearch: parseDexRangeSearch,
  component: DexRunScores,
});
