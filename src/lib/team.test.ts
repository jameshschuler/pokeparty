import { describe, expect, it } from "vitest";
import { regularMembers } from "../test/members";
import {
  addPokemon,
  createTeam,
  hasPokemon,
  isTeamFull,
  removePokemon,
  toggleShiny,
} from "./team";

describe("addPokemon", () => {
  it("adds a regular member to an empty team", () => {
    expect(addPokemon([], 25, false)).toEqual(regularMembers(25));
  });

  it("adds a shiny member", () => {
    expect(addPokemon([], 25, true)).toEqual([{ pokemonId: 25, shiny: true }]);
  });

  it("appends in pick order", () => {
    expect(addPokemon(regularMembers(1, 4), 7, false)).toEqual(
      regularMembers(1, 4, 7),
    );
  });

  it("ignores a Pokémon already on the team", () => {
    const members = [{ pokemonId: 25, shiny: true }];

    expect(addPokemon(members, 25, false)).toBe(members);
  });

  it("ignores a seventh Pokémon", () => {
    const full = regularMembers(1, 2, 3, 4, 5, 6);

    expect(addPokemon(full, 7, false)).toBe(full);
  });
});

describe("removePokemon", () => {
  it("removes the Pokémon", () => {
    expect(removePokemon(regularMembers(1, 4, 7), 4)).toEqual(
      regularMembers(1, 7),
    );
  });

  it("leaves the team unchanged when the Pokémon is missing", () => {
    expect(removePokemon(regularMembers(1, 4), 7)).toEqual(
      regularMembers(1, 4),
    );
  });
});

describe("toggleShiny", () => {
  it("turns shiny on and back off", () => {
    const shiny = toggleShiny(regularMembers(1, 4), 4);

    expect(shiny).toEqual([
      { pokemonId: 1, shiny: false },
      { pokemonId: 4, shiny: true },
    ]);
    expect(toggleShiny(shiny, 4)).toEqual(regularMembers(1, 4));
  });

  it("leaves the team unchanged when the Pokémon is missing", () => {
    expect(toggleShiny(regularMembers(1), 4)).toEqual(regularMembers(1));
  });
});

describe("hasPokemon", () => {
  it.each([
    [regularMembers(1, 4), 4, true],
    [regularMembers(1, 4), 7, false],
    [[], 1, false],
  ])("%j has %s -> %s", (members, pokemonId, expected) => {
    expect(hasPokemon(members, pokemonId)).toBe(expected);
  });
});

describe("isTeamFull", () => {
  it.each([
    [[], false],
    [regularMembers(1, 2, 3, 4, 5), false],
    [regularMembers(1, 2, 3, 4, 5, 6), true],
  ])("%j -> %s", (members, expected) => {
    expect(isTeamFull(members)).toBe(expected);
  });
});

describe("createTeam", () => {
  it("stamps both timestamps and a unique id", () => {
    const first = createTeam(regularMembers(25), 1000);
    const second = createTeam(regularMembers(25), 1000);

    expect(first).toMatchObject({
      members: regularMembers(25),
      createdAt: 1000,
      updatedAt: 1000,
    });
    expect(first.id).not.toBe(second.id);
  });
});
