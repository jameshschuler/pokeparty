import { createFileRoute } from "@tanstack/react-router";
import { DexRunGame } from "../components/dex-run/DexRunGame";
import { DexRunProvider } from "../contexts/dex-run-context";
import { parseDexRangeSearch } from "../lib/dex-run";

export const Route = createFileRoute("/dex-run/play")({
  validateSearch: parseDexRangeSearch,
  component: DexRunRoute,
});

function DexRunRoute() {
  const { range } = Route.useSearch();

  return (
    <DexRunProvider key={range} range={range}>
      <DexRunGame />
    </DexRunProvider>
  );
}
