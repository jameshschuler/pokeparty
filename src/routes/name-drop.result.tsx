import { createFileRoute } from "@tanstack/react-router";
import { NameDropResultCard } from "../components/name-drop/NameDropResultCard";
import {
  parseNameDropResult,
  type NameDropResult,
} from "../lib/name-drop-result";

export const Route = createFileRoute("/name-drop/result")({
  validateSearch: (search): Partial<NameDropResult> =>
    parseNameDropResult(search) ?? {},
  component: NameDropResultRoute,
});

function NameDropResultRoute() {
  const result = parseNameDropResult(Route.useSearch());

  return <NameDropResultCard result={result} />;
}
