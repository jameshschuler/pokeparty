import { describe, expect, it } from "vitest";
import { addPokemon, createTeam, isTeamFull, removePokemon } from "./team";

describe("addPokemon", () => {
  it("adds to an empty team", () => {
    expect(addPokemon([], 25)).toEqual([25]);
  });

  it("appends in pick order", () => {
    expect(addPokemon([1, 4], 7)).toEqual([1, 4, 7]);
  });

  it("ignores a Pokémon already on the team", () => {
    expect(addPokemon([25, 6], 25)).toEqual([25, 6]);
  });

  it("ignores a seventh Pokémon", () => {
    expect(addPokemon([1, 2, 3, 4, 5, 6], 7)).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe("removePokemon", () => {
  it("removes the Pokémon", () => {
    expect(removePokemon([1, 4, 7], 4)).toEqual([1, 7]);
  });

  it("leaves the team unchanged when the Pokémon is missing", () => {
    expect(removePokemon([1, 4], 7)).toEqual([1, 4]);
  });
});

describe("isTeamFull", () => {
  it.each([
    [[], false],
    [[1, 2, 3, 4, 5], false],
    [[1, 2, 3, 4, 5, 6], true],
  ])("%j -> %s", (pokemonIds, expected) => {
    expect(isTeamFull(pokemonIds)).toBe(expected);
  });
});

describe("createTeam", () => {
  it("stamps both timestamps and a unique id", () => {
    const first = createTeam([25], 1000);
    const second = createTeam([25], 1000);

    expect(first).toMatchObject({
      pokemonIds: [25],
      createdAt: 1000,
      updatedAt: 1000,
    });
    expect(first.id).not.toBe(second.id);
  });
});
