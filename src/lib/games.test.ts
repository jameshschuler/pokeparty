import { describe, expect, it } from "vitest";
import { findGame, GAME_GROUPS, gameGeneration, isGameId } from "./games";

describe("games", () => {
  it("gives every game a unique id", () => {
    const ids = GAME_GROUPS.flatMap((group) =>
      group.games.map((game) => game.id),
    );

    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each([
    ["red-blue", 1],
    ["crystal", 2],
    ["legends-arceus", 8],
    ["legends-z-a", 9],
    ["heart-soul", 3],
  ] as const)("puts %s in generation %s", (gameId, generation) => {
    expect(gameGeneration(gameId)).toBe(generation);
  });

  it("finds a game by id", () => {
    expect(findGame("heart-soul").name).toBe("Heart & Soul");
  });

  it.each([
    ["emerald", true],
    ["legends-z-a", true],
    ["pokemon-uranium", false],
    ["", false],
    [7, false],
    [null, false],
  ])("treats %s as a game id: %s", (value, expected) => {
    expect(isGameId(value)).toBe(expected);
  });
});
