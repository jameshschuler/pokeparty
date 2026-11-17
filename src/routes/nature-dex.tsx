import { createFileRoute } from "@tanstack/react-router";
import { NatureDex } from "../components/nature-dex/NatureDex";
import { NatureDexProvider } from "../contexts/nature-dex-context";
import { parseNatureDexSearch } from "../lib/nature-dex-filters";

export const Route = createFileRoute("/nature-dex")({
  validateSearch: parseNatureDexSearch,
  component: NatureDexRoute,
});

function NatureDexRoute() {
  return (
    <NatureDexProvider>
      <NatureDex />
    </NatureDexProvider>
  );
}
