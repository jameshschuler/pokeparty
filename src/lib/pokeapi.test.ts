import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchPokemonIdsByType, fetchPokemonList, idFromUrl } from "./pokeapi";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("idFromUrl", () => {
  it.each([
    ["https://pokeapi.co/api/v2/pokemon-species/25/", 25],
    ["https://pokeapi.co/api/v2/pokemon/10034", 10034],
  ])("%s -> %s", (url, expected) => {
    expect(idFromUrl(url)).toBe(expected);
  });

  it("throws when there is no id", () => {
    expect(() => idFromUrl("https://pokeapi.co/api/v2/pokemon/")).toThrow();
  });
});

describe("fetchPokemonList", () => {
  const species = {
    results: [
      { name: "rattata", url: "https://pokeapi.co/api/v2/pokemon-species/19/" },
      {
        name: "darumaka",
        url: "https://pokeapi.co/api/v2/pokemon-species/554/",
      },
    ],
  };
  const forms = {
    results: [
      {
        name: "rattata-alola",
        url: "https://pokeapi.co/api/v2/pokemon/10091/",
      },
      {
        name: "raticate-totem-alola",
        url: "https://pokeapi.co/api/v2/pokemon/10093/",
      },
      {
        name: "darumaka-galar",
        url: "https://pokeapi.co/api/v2/pokemon/10176/",
      },
      {
        name: "charizard-mega-x",
        url: "https://pokeapi.co/api/v2/pokemon/10034/",
      },
    ],
  };

  function mockApi(formsStatus = 200) {
    const fetchMock = vi.fn(async (url: string) =>
      url.includes("pokemon-species")
        ? jsonResponse(species)
        : jsonResponse(forms, formsStatus),
    );
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  it("lists species with their regional forms in dex order", async () => {
    mockApi();

    await expect(fetchPokemonList()).resolves.toEqual([
      { id: 19, speciesId: 19, name: "rattata" },
      { id: 10091, speciesId: 19, name: "rattata-alola" },
      { id: 554, speciesId: 554, name: "darumaka" },
      { id: 10176, speciesId: 554, name: "darumaka-galar" },
    ]);
  });

  it("requests every species and the forms after them", async () => {
    const fetchMock = mockApi();

    await fetchPokemonList();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/pokemon-species?limit=1025"),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/pokemon?offset=1025"),
    );
  });

  it("throws when either request fails", async () => {
    mockApi(500);

    await expect(fetchPokemonList()).rejects.toThrow("500");
  });
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
