import { describe, expect, it } from "vitest";
import { GAME_GROUPS } from "./games";
import { gamePokemon } from "./game-dex";

describe("gamePokemon", () => {
  function names(gameId: Parameters<typeof gamePokemon>[0]) {
    return gamePokemon(gameId).map((pokemon) => pokemon.displayName);
  }

  it.each(GAME_GROUPS.flatMap((group) => group.games.map((game) => game.id)))(
    "has Pokémon for %s",
    (gameId) => {
      expect(gamePokemon(gameId).length).toBeGreaterThan(100);
    },
  );

  it.each([
    ["emerald", "Mudkip", true],
    ["emerald", "Bulbasaur", false],
    ["red-blue", "Mew", true],
    ["red-blue", "Chikorita", false],
    ["heart-soul", "Deoxys", true],
    ["heart-soul", "Turtwig", false],
  ] as const)("in %s, has %s: %s", (gameId, name, expected) => {
    expect(names(gameId).includes(name)).toBe(expected);
  });

  it("leaves out forms from later generations", () => {
    expect(names("red-blue")).not.toContain("Alolan Rattata");
    expect(names("red-blue")).toContain("Rattata");
  });

  it("lists a game's Pokémon in its own Pokédex order", () => {
    expect(names("crystal").slice(0, 3)).toEqual([
      "Chikorita",
      "Bayleef",
      "Meganium",
    ]);
    expect(names("emerald").slice(0, 3)).toEqual([
      "Treecko",
      "Grovyle",
      "Sceptile",
    ]);
  });

  it("adds a DLC Pokédex after the main one", () => {
    const swordShield = names("sword-shield");

    expect(swordShield.indexOf("Kubfu")).toBeGreaterThan(
      swordShield.indexOf("Eternatus"),
    );
  });

  it("lists every form next to its species", () => {
    const sunMoon = names("sun-moon");
    const rattata = sunMoon.indexOf("Rattata");

    expect(sunMoon[rattata + 1]).toBe("Alolan Rattata");
  });
});
