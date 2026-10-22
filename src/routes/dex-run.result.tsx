import { createFileRoute } from "@tanstack/react-router";
import { DexRunResultCard } from "../components/dex-run/DexRunResultCard";
import { parseDexRunResult, type DexRunResult } from "../lib/dex-run-result";

export const Route = createFileRoute("/dex-run/result")({
  validateSearch: (search): Partial<DexRunResult> =>
    parseDexRunResult(search) ?? {},
  component: DexRunResultRoute,
});

function DexRunResultRoute() {
  const result = parseDexRunResult(Route.useSearch());

  return <DexRunResultCard result={result} />;
}
