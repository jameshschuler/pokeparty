import { createFileRoute } from "@tanstack/react-router";
import { NameDropGame } from "../components/name-drop/NameDropGame";
import { NameDropProvider } from "../contexts/name-drop-context";

export const Route = createFileRoute("/name-drop/play")({
  component: NameDropRoute,
});

function NameDropRoute() {
  return (
    <NameDropProvider>
      <NameDropGame />
    </NameDropProvider>
  );
}
