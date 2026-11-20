import { describe, expect, it } from "vitest";
import { evolutionOptions, nextEvolutions } from "./evolutions";

function names(pokemonIds: { displayName: string }[]) {
  return pokemonIds.map((pokemon) => pokemon.displayName);
}

describe("nextEvolutions", () => {
  it.each([
    ["Elekid", 239, ["Electabuzz"]],
    ["Electabuzz", 125, ["Electivire"]],
    ["Venusaur", 3, []],
    ["Alolan Rattata", 10091, ["Alolan Raticate"]],
    ["Rattata", 19, ["Raticate"]],
    ["Pikachu", 25, ["Raichu", "Alolan Raichu"]],
    ["Galarian Meowth", 10161, ["Perrserker"]],
    ["Alolan Meowth", 10107, ["Alolan Persian"]],
    ["an unknown Pokémon", 99999, []],
  ])("evolves %s into the right Pokémon", (_, pokemonId, expected) => {
    expect(names(nextEvolutions(pokemonId))).toEqual(expected);
  });

  it("offers every Eevee evolution", () => {
    expect(nextEvolutions(133)).toHaveLength(8);
  });
});

describe("evolutionOptions", () => {
  it("leaves out evolutions from later generations", () => {
    expect(names(evolutionOptions(133, 2))).toEqual([
      "Vaporeon",
      "Jolteon",
      "Flareon",
      "Espeon",
      "Umbreon",
    ]);
    expect(evolutionOptions(125, 2)).toEqual([]);
  });

  it("keeps evolutions from earlier generations", () => {
    expect(names(evolutionOptions(42, 3))).toEqual(["Crobat"]);
  });

  it("leaves out regional forms from later generations", () => {
    expect(names(evolutionOptions(25, 1))).toEqual(["Raichu"]);
    expect(names(evolutionOptions(25, 7))).toEqual(["Raichu", "Alolan Raichu"]);
  });
});
