import { describe, expect, it } from "vitest";
import { buildPokedex, findPokemon, POKEDEX, SPECIES } from "./pokedex";

describe("buildPokedex", () => {
  const pokedex = buildPokedex({
    species: [
      {
        id: 487,
        name: "giratina",
        displayName: "Giratina",
        region: "sinnoh",
        legendary: true,
      },
      {
        id: 554,
        name: "darumaka",
        displayName: "Darumaka",
        region: "unova",
        legendary: false,
      },
    ],
    forms: [
      {
        id: 10176,
        speciesId: 554,
        name: "darumaka-galar",
        displayName: "Galarian Darumaka",
        variant: null,
        region: "galar",
      },
      {
        id: 10007,
        speciesId: 487,
        name: "giratina-origin",
        displayName: "Giratina",
        variant: "Origin Forme",
        region: "sinnoh",
      },
    ],
  });

  it("lists species and forms in dex order", () => {
    expect(pokedex.map((pokemon) => pokemon.id)).toEqual([
      487, 10007, 554, 10176,
    ]);
  });

  it("gives species their own number and no variant", () => {
    expect(pokedex[0]).toMatchObject({ speciesId: 487, variant: null });
  });

  it("gives forms their species' legendary flag", () => {
    expect(pokedex[1].legendary).toBe(true);
    expect(pokedex[3].legendary).toBe(false);
  });

  it("builds search text from the slug and label", () => {
    expect(pokedex[1].searchText).toBe(
      "giratina origin giratina (origin forme)",
    );
  });
});

describe("POKEDEX", () => {
  it("has every species plus the chosen forms", () => {
    expect(POKEDEX.filter((pokemon) => pokemon.id <= 1025)).toHaveLength(1025);
    expect(POKEDEX.length).toBeGreaterThan(1025);
  });

  it.each([
    [122, "Mr. Mime", null],
    [29, "Nidoran♀", null],
    [10007, "Giratina", "Origin Forme"],
    [10008, "Heat Rotom", null],
    [10176, "Galarian Darumaka", null],
    [10252, "Paldean Tauros", "Aqua Breed"],
  ])("names %s as %s / %s", (id, displayName, variant) => {
    expect(findPokemon(id)).toMatchObject({ displayName, variant });
  });

  it.each([
    [10178, "darmanitan-galar-zen"],
    [10099, "pikachu-alola-cap"],
    [10093, "raticate-totem-alola"],
    [10034, "charizard-mega-x"],
  ])("leaves out %s (%s)", (id) => {
    expect(findPokemon(id)).toBeUndefined();
  });

  it.each([
    [150, true],
    [151, true],
    [10007, true],
    [25, false],
  ])("marks %s legendary: %s", (id, legendary) => {
    expect(findPokemon(id)?.legendary).toBe(legendary);
  });

  it.each([
    [1, "kanto"],
    [152, "johto"],
    [899, "hisui"],
    [888, "galar"],
    [10229, "hisui"],
    [10247, "hisui"],
    [10245, "hisui"],
    [10272, "paldea"],
    [10007, "sinnoh"],
    [1025, "paldea"],
  ])("puts %s in %s", (id, region) => {
    expect(findPokemon(id)?.region).toBe(region);
  });
});

describe("SPECIES", () => {
  it("has each of the 1,025 species once and no forms", () => {
    expect(SPECIES).toHaveLength(1025);
    expect(SPECIES.every((pokemon) => pokemon.id === pokemon.speciesId)).toBe(
      true,
    );
    expect(SPECIES.some((pokemon) => pokemon.id === 10007)).toBe(false);
  });
});
