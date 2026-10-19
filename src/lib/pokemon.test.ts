import { describe, expect, it } from "vitest";
import {
  compareDexOrder,
  filterPokemon,
  formatPokemonName,
  formatPokemonNumber,
  isValidPokemonId,
  matchesSearch,
  parseRegionalForm,
  pokemonNameParts,
  spriteUrl,
} from "./pokemon";

const pikachu = { id: 25, speciesId: 25, name: "pikachu" };
const mrMime = { id: 122, speciesId: 122, name: "mr-mime" };
const darumaka = { id: 554, speciesId: 554, name: "darumaka" };
const galarianDarumaka = { id: 10176, speciesId: 554, name: "darumaka-galar" };

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
    expect(spriteUrl(10176)).toMatch(/official-artwork\/10176\.png$/);
  });
});

describe("parseRegionalForm", () => {
  it.each([
    ["darumaka-galar", { baseName: "darumaka", region: "galar" }],
    ["mr-mime-galar", { baseName: "mr-mime", region: "galar" }],
    [
      "tauros-paldea-combat-breed",
      { baseName: "tauros", region: "paldea", variant: "combat-breed" },
    ],
    ["growlithe-hisui", { baseName: "growlithe", region: "hisui" }],
  ])("parses %s", (name, expected) => {
    expect(parseRegionalForm(name)).toMatchObject(expected);
  });

  it.each([
    "pikachu",
    "mr-mime",
    "charizard-mega-x",
    "pikachu-alola-cap",
    "darmanitan-galar-zen",
  ])("rejects %s", (name) => {
    expect(parseRegionalForm(name)).toBeNull();
  });
});

describe("formatPokemonName", () => {
  it.each([
    ["pikachu", "Pikachu"],
    ["mr-mime", "Mr Mime"],
    ["tapu-koko", "Tapu Koko"],
    ["darumaka-galar", "Galarian Darumaka"],
    ["vulpix-alola", "Alolan Vulpix"],
    ["mr-mime-galar", "Galarian Mr Mime"],
    ["darmanitan-galar-standard", "Galarian Darmanitan"],
    ["tauros-paldea-combat-breed", "Paldean Tauros (Combat Breed)"],
  ])("%s -> %s", (name, expected) => {
    expect(formatPokemonName(name)).toBe(expected);
  });
});

describe("pokemonNameParts", () => {
  it.each([
    ["pikachu", { name: "Pikachu", variant: null }],
    ["darumaka-galar", { name: "Galarian Darumaka", variant: null }],
    [
      "darmanitan-galar-standard",
      { name: "Galarian Darmanitan", variant: null },
    ],
    [
      "tauros-paldea-aqua-breed",
      { name: "Paldean Tauros", variant: "Aqua Breed" },
    ],
  ])("%s -> %o", (name, expected) => {
    expect(pokemonNameParts(name)).toEqual(expected);
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
  it("puts regional forms right after their species", () => {
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
  ])("%o with %j -> %s", (pokemon, query, expected) => {
    expect(matchesSearch(pokemon, query)).toBe(expected);
  });
});

describe("filterPokemon", () => {
  const list = [
    { id: 1, speciesId: 1, name: "bulbasaur" },
    { id: 4, speciesId: 4, name: "charmander" },
    { id: 6, speciesId: 6, name: "charizard" },
  ];

  it("returns everything with no query or type", () => {
    expect(filterPokemon(list, "", undefined)).toEqual(list);
  });

  it("filters by query", () => {
    expect(filterPokemon(list, "char", undefined).map((p) => p.id)).toEqual([
      4, 6,
    ]);
  });

  it("filters by type ids", () => {
    expect(filterPokemon(list, "", new Set([1, 6])).map((p) => p.id)).toEqual([
      1, 6,
    ]);
  });

  it("combines query and type", () => {
    expect(
      filterPokemon(list, "char", new Set([1, 6])).map((p) => p.id),
    ).toEqual([6]);
  });

  it("returns nothing for an empty type set", () => {
    expect(filterPokemon(list, "", new Set())).toEqual([]);
  });
});
