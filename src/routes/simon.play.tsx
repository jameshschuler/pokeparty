import { createFileRoute } from "@tanstack/react-router";
import { SimonGame } from "../components/simon/SimonGame";
import { SimonProvider } from "../contexts/simon-context";
import { parseSimonLevelSearch } from "../lib/simon";

export const Route = createFileRoute("/simon/play")({
  validateSearch: parseSimonLevelSearch,
  component: SimonRoute,
});

function SimonRoute() {
  const { level } = Route.useSearch();

  return (
    <SimonProvider key={level} level={level}>
      <SimonGame />
    </SimonProvider>
  );
}
