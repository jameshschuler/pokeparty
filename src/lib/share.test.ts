import { describe, expect, it } from "vitest";
import { parseSharedTeam, resolveSharedTeam, teamShareUrl } from "./share";

describe("teamShareUrl", () => {
  it("puts the ids in the team param", () => {
    expect(teamShareUrl([25, 6, 9], "https://pokeparty.app")).toBe(
      "https://pokeparty.app/share?team=25,6,9",
    );
  });

  it("round-trips through parseSharedTeam", () => {
    const url = new URL(teamShareUrl([25, 6, 9], "https://pokeparty.app"));

    expect(parseSharedTeam(url.searchParams.get("team") ?? "")).toEqual([
      25, 6, 9,
    ]);
  });
});

describe("parseSharedTeam", () => {
  it.each([
    ["", []],
    ["abc", []],
    ["25", [25]],
    ["25,6,9", [25, 6, 9]],
    ["0,25,10176,-1,2.5,abc", [25, 10176]],
    ["25,25,6", [25, 6]],
    ["1,2,3,4,5,6,7", [1, 2, 3, 4, 5, 6, 7]],
  ])("%j -> %j", (param, expected) => {
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
    expect(
      resolveSharedTeam([25, 9999, 1], pokedex).map((pokemon) => pokemon.id),
    ).toEqual([25, 1]);
  });

  it("caps at six after dropping unknown ids", () => {
    expect(
      resolveSharedTeam([9999, 1, 4, 7, 25, 6, 9, 10176], pokedex).map(
        (pokemon) => pokemon.id,
      ),
    ).toEqual([1, 4, 7, 25, 6, 9]);
  });

  it("returns nothing when no id is known", () => {
    expect(resolveSharedTeam([9999], pokedex)).toEqual([]);
  });
});
