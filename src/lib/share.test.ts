import { describe, expect, it } from "vitest";
import { regularMembers } from "../test/members";
import { parseSharedTeam, resolveSharedTeam, teamShareUrl } from "./share";

const origin = "https://pokeparty.app";

describe("teamShareUrl", () => {
  it("puts the ids in the team param", () => {
    expect(teamShareUrl(regularMembers(25, 6, 9), origin)).toBe(
      "https://pokeparty.app/share?team=25,6,9",
    );
  });

  it("marks shiny members with an s", () => {
    const members = [
      { pokemonId: 25, shiny: true },
      { pokemonId: 6, shiny: false },
    ];

    expect(teamShareUrl(members, origin)).toBe(
      "https://pokeparty.app/share?team=25s,6",
    );
  });

  it("round-trips through parseSharedTeam", () => {
    const members = [
      { pokemonId: 25, shiny: true },
      { pokemonId: 10176, shiny: false },
    ];
    const url = new URL(teamShareUrl(members, origin));

    expect(parseSharedTeam(url.searchParams.get("team") ?? "")).toEqual(
      members,
    );
  });
});

describe("parseSharedTeam", () => {
  it.each([
    ["", []],
    ["abc", []],
    ["25", regularMembers(25)],
    ["25,6,9", regularMembers(25, 6, 9)],
    ["0,25,10176,-1,2.5,abc", regularMembers(25, 10176)],
    ["25,25,6", regularMembers(25, 6)],
    ["1,2,3,4,5,6,7", regularMembers(1, 2, 3, 4, 5, 6, 7)],
    [" 25 , 6", regularMembers(25, 6)],
  ])("%j -> regular members", (param, expected) => {
    expect(parseSharedTeam(param)).toEqual(expected);
  });

  it.each([
    [
      "25s,6",
      [
        { pokemonId: 25, shiny: true },
        { pokemonId: 6, shiny: false },
      ],
    ],
    ["25s,25", [{ pokemonId: 25, shiny: true }]],
    ["25x,6ss,s,6", regularMembers(6)],
    [
      " 25s ,6",
      [
        { pokemonId: 25, shiny: true },
        { pokemonId: 6, shiny: false },
      ],
    ],
  ])("%j -> shiny-aware members", (param, expected) => {
    expect(parseSharedTeam(param)).toEqual(expected);
  });
});

describe("resolveSharedTeam", () => {
  const pokedex = [1, 4, 6, 7, 9, 25, 10176].map((id) => ({
    id,
    speciesId: id,
    name: `pokemon-${id}`,
  }));

  it("keeps link order and drops unknown ids", () => {
    expect(resolveSharedTeam(regularMembers(25, 9999, 1), pokedex)).toEqual(
      regularMembers(25, 1),
    );
  });

  it("caps at six after dropping unknown ids", () => {
    expect(
      resolveSharedTeam(
        regularMembers(9999, 1, 4, 7, 25, 6, 9, 10176),
        pokedex,
      ),
    ).toEqual(regularMembers(1, 4, 7, 25, 6, 9));
  });

  it("keeps the shiny flag", () => {
    const members = [{ pokemonId: 25, shiny: true }];

    expect(resolveSharedTeam(members, pokedex)).toEqual(members);
  });

  it("returns nothing when no id is known", () => {
    expect(resolveSharedTeam(regularMembers(9999), pokedex)).toEqual([]);
  });
});
