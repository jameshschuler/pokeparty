import { describe, expect, it } from "vitest";
import type { PokemonSummary } from "../types/pokemon";
import {
  buildSearchText,
  compareDexOrder,
  filterPokemon,
  formatMemberName,
  formatPokemonLabel,
  formatPokemonNumber,
  isValidPokemonId,
  matchesSearch,
  spriteUrl,
} from "./pokemon";

function summary(
  overrides: Partial<Omit<PokemonSummary, "searchText">>,
): PokemonSummary {
  const entry = {
    id: 1,
    speciesId: 1,
    name: "bulbasaur",
    displayName: "Bulbasaur",
    variant: null,
    region: "kanto" as const,
    legendary: false,
    ...overrides,
  };
  return {
    ...entry,
    searchText: buildSearchText(entry.name, formatPokemonLabel(entry)),
  };
}

const pikachu = summary({
  id: 25,
  speciesId: 25,
  name: "pikachu",
  displayName: "Pikachu",
});
const mrMime = summary({
  id: 122,
  speciesId: 122,
  name: "mr-mime",
  displayName: "Mr. Mime",
});
const darumaka = summary({
  id: 554,
  speciesId: 554,
  name: "darumaka",
  displayName: "Darumaka",
  region: "unova",
});
const galarianDarumaka = summary({
  id: 10176,
  speciesId: 554,
  name: "darumaka-galar",
  displayName: "Galarian Darumaka",
  region: "galar",
});
const originGiratina = summary({
  id: 10007,
  speciesId: 487,
  name: "giratina-origin",
  displayName: "Giratina",
  variant: "Origin Forme",
  region: "sinnoh",
  legendary: true,
});

describe("isValidPokemonId", () => {
  it.each([
    [1, true],
    [1025, true],
    [10176, true],
    [0, false],
    [-4, false],
    [2.5, false],
    [Number.NaN, false],
  ])("%s -> %s", (id, expected) => {
    expect(isValidPokemonId(id)).toBe(expected);
  });
});

describe("spriteUrl", () => {
  it("points at the official artwork for the id", () => {
    expect(spriteUrl(10176, false)).toMatch(/official-artwork\/10176\.png$/);
  });

  it("points at the shiny artwork for shiny Pokémon", () => {
    expect(spriteUrl(25, true)).toMatch(/official-artwork\/shiny\/25\.png$/);
  });
});

describe("buildSearchText", () => {
  it("joins the slug and label in lowercase", () => {
    expect(buildSearchText("mr-mime", "Mr. Mime")).toBe("mr mime mr. mime");
  });
});

describe("formatPokemonLabel", () => {
  it("uses the display name alone without a variant", () => {
    expect(formatPokemonLabel(galarianDarumaka)).toBe("Galarian Darumaka");
  });

  it("adds the variant in parentheses", () => {
    expect(formatPokemonLabel(originGiratina)).toBe("Giratina (Origin Forme)");
  });
});

describe("formatMemberName", () => {
  it.each([
    [pikachu, false, "Pikachu"],
    [pikachu, true, "shiny Pikachu"],
    [galarianDarumaka, true, "shiny Galarian Darumaka"],
  ])("%o shiny=%s -> %s", (pokemon, shiny, expected) => {
    expect(formatMemberName(pokemon, shiny)).toBe(expected);
  });
});

describe("formatPokemonNumber", () => {
  it.each([
    [1, "#0001"],
    [25, "#0025"],
    [1025, "#1025"],
  ])("%s -> %s", (id, expected) => {
    expect(formatPokemonNumber(id)).toBe(expected);
  });
});

describe("compareDexOrder", () => {
  it("puts forms right after their species", () => {
    const sorted = [galarianDarumaka, pikachu, darumaka].sort(compareDexOrder);

    expect(sorted.map((pokemon) => pokemon.id)).toEqual([25, 554, 10176]);
  });
});

describe("matchesSearch", () => {
  it.each([
    [pikachu, "", true],
    [pikachu, "   ", true],
    [pikachu, "PIKA", true],
    [pikachu, "chu", true],
    [pikachu, "bulba", false],
    [pikachu, "25", true],
    [pikachu, "#25", true],
    [pikachu, "0025", true],
    [pikachu, "2", true],
    [pikachu, "26", false],
    [pikachu, "0", true],
    [pikachu, "#00", true],
    [pikachu, "025", true],
    [pikachu, "0026", false],
    [mrMime, "mr mime", true],
    [mrMime, "mr-mime", true],
    [galarianDarumaka, "darumaka", true],
    [galarianDarumaka, "galarian", true],
    [galarianDarumaka, "galar", true],
    [galarianDarumaka, "554", true],
    [galarianDarumaka, "10176", false],
    [originGiratina, "origin", true],
    [originGiratina, "giratina origin", true],
    [originGiratina, "forme", true],
  ])("%o with %j -> %s", (pokemon, query, expected) => {
    expect(matchesSearch(pokemon, query)).toBe(expected);
  });
});

describe("filterPokemon", () => {
  const list = [pikachu, darumaka, galarianDarumaka, originGiratina];
  const noFilter = {
    query: "",
    typeIds: undefined,
    region: null,
    legendaryOnly: false,
  };

  function ids(filter: Partial<Parameters<typeof filterPokemon>[1]>) {
    return filterPokemon(list, { ...noFilter, ...filter }).map((p) => p.id);
  }

  it("returns everything with no filter", () => {
    expect(ids({})).toEqual([25, 554, 10176, 10007]);
  });

  it("filters by query", () => {
    expect(ids({ query: "darumaka" })).toEqual([554, 10176]);
  });

  it("filters by type ids", () => {
    expect(ids({ typeIds: new Set([25, 10176]) })).toEqual([25, 10176]);
  });

  it("filters by region, including regional forms", () => {
    expect(ids({ region: "galar" })).toEqual([10176]);
    expect(ids({ region: "unova" })).toEqual([554]);
  });

  it("filters to legendaries", () => {
    expect(ids({ legendaryOnly: true })).toEqual([10007]);
  });

  it("combines every filter", () => {
    expect(
      ids({ query: "dar", region: "galar", typeIds: new Set([10176]) }),
    ).toEqual([10176]);
    expect(ids({ region: "kanto", legendaryOnly: true })).toEqual([]);
  });

  it("returns nothing for an empty type set", () => {
    expect(ids({ typeIds: new Set() })).toEqual([]);
  });
});
