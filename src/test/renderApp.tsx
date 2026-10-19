import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory } from "@tanstack/react-router";
import { render } from "@testing-library/react";
import { vi } from "vitest";
import { App } from "../App";
import { createAppRouter } from "../router";

const TEST_SPECIES: [number, string][] = [
  [1, "bulbasaur"],
  [2, "ivysaur"],
  [3, "venusaur"],
  [4, "charmander"],
  [5, "charmeleon"],
  [6, "charizard"],
  [7, "squirtle"],
  [554, "darumaka"],
];

const TEST_FORMS: [number, string][] = [
  [10176, "darumaka-galar"],
  [10178, "darmanitan-galar-zen"],
];

function toResults(entries: [number, string][], resource: string) {
  return entries.map(([id, name]) => ({
    name,
    url: `https://pokeapi.co/api/v2/${resource}/${id}/`,
  }));
}

export function mockPokemonList() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const results = url.includes("pokemon-species")
        ? toResults(TEST_SPECIES, "pokemon-species")
        : toResults(TEST_FORMS, "pokemon");
      return new Response(JSON.stringify({ results }));
    }),
  );
}

export function renderApp(path: string) {
  const router = createAppRouter(
    createMemoryHistory({ initialEntries: [path] }),
  );
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(<App router={router} queryClient={queryClient} />);
  return router;
}
