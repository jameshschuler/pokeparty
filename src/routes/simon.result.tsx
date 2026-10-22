import { createFileRoute } from "@tanstack/react-router";
import { SimonResultCard } from "../components/simon/SimonResultCard";
import { parseSimonResult, type SimonResult } from "../lib/simon-result";

export const Route = createFileRoute("/simon/result")({
  validateSearch: (search): Partial<SimonResult> =>
    parseSimonResult(search) ?? {},
  component: SimonResultRoute,
});

function SimonResultRoute() {
  const result = parseSimonResult(Route.useSearch());

  return <SimonResultCard result={result} />;
}
