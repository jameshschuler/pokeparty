import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchPokemonIdsByType } from "./pokeapi";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchPokemonIdsByType", () => {
  it("returns ids for species and forms", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          pokemon: [
            {
              pokemon: {
                name: "darumaka-galar",
                url: "https://pokeapi.co/api/v2/pokemon/10176/",
              },
            },
            {
              pokemon: {
                name: "vulpix-alola",
                url: "https://pokeapi.co/api/v2/pokemon/10103/",
              },
            },
          ],
        }),
      ),
    );

    await expect(fetchPokemonIdsByType("ice")).resolves.toEqual([10176, 10103]);
  });
});
