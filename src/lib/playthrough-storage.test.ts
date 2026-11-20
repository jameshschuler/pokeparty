import { beforeEach, describe, expect, it } from "vitest";
import type { Playthrough, TeamStint } from "../types/playthrough";
import { loadPlaythroughs, savePlaythroughs } from "./playthrough-storage";

const mudkip: TeamStint = {
  id: "s1",
  pokemonId: 258,
  shiny: false,
  nickname: "Mud",
  joinedLevel: 5,
  joinedStep: 1,
  updates: [{ step: 2, level: 10, pokemonId: 258 }],
  leftLevel: 16,
  leftStep: 3,
};

const marshtomp: TeamStint = {
  ...mudkip,
  id: "s2",
  pokemonId: 259,
  nickname: null,
  joinedLevel: 16,
  joinedStep: 3,
  updates: [],
  leftLevel: null,
  leftStep: null,
};

const playthrough: Playthrough = {
  id: "p1",
  gameId: "emerald",
  name: "Nuzlocke #2",
  stints: [mudkip, marshtomp],
  createdAt: 1,
  updatedAt: 2,
};

function store(value: unknown) {
  localStorage.setItem("pokeparty:playthroughs", JSON.stringify(value));
}

describe("playthrough storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns no playthroughs when nothing is stored", () => {
    expect(loadPlaythroughs()).toEqual([]);
  });

  it("keeps a member with no join level", () => {
    const unknown = {
      ...playthrough,
      stints: [{ ...marshtomp, joinedLevel: null }],
    };
    savePlaythroughs([unknown]);

    expect(loadPlaythroughs()).toEqual([unknown]);
  });

  it("round-trips saved playthroughs", () => {
    savePlaythroughs([playthrough, { ...playthrough, id: "p2", name: null }]);

    expect(loadPlaythroughs()).toEqual([
      playthrough,
      { ...playthrough, id: "p2", name: null },
    ]);
  });

  it.each([
    ["invalid JSON", "{nope"],
    ["a non-array", JSON.stringify({ playthroughs: [playthrough] })],
    ["null", "null"],
  ])("returns no playthroughs for %s", (_, raw) => {
    localStorage.setItem("pokeparty:playthroughs", raw);

    expect(loadPlaythroughs()).toEqual([]);
  });

  it.each<[string, unknown]>([
    ["an unknown game", { ...playthrough, gameId: "pokemon-uranium" }],
    ["a numeric id", { ...playthrough, id: 7 }],
    ["missing stints", { ...playthrough, stints: undefined }],
    [
      "a bad Pokémon id",
      { ...playthrough, stints: [{ ...mudkip, pokemonId: 0 }] },
    ],
    [
      "level 101",
      { ...playthrough, stints: [{ ...mudkip, joinedLevel: 101 }] },
    ],
    [
      "a leave below the join",
      { ...playthrough, stints: [{ ...mudkip, leftLevel: 4 }] },
    ],
    [
      "missing updates",
      { ...playthrough, stints: [{ ...mudkip, updates: undefined }] },
    ],
    [
      "an update below the join level",
      {
        ...playthrough,
        stints: [
          { ...mudkip, updates: [{ step: 2, level: 4, pokemonId: 258 }] },
        ],
      },
    ],
    [
      "an update after the leave",
      {
        ...playthrough,
        stints: [
          { ...mudkip, updates: [{ step: 4, level: 12, pokemonId: 258 }] },
        ],
      },
    ],
    [
      "an update with a bad Pokémon",
      {
        ...playthrough,
        stints: [
          { ...mudkip, updates: [{ step: 2, level: 12, pokemonId: 0 }] },
        ],
      },
    ],
    [
      "a leave before the join",
      { ...playthrough, stints: [{ ...mudkip, leftStep: 1 }] },
    ],
    [
      "a leave level with no step",
      { ...playthrough, stints: [{ ...mudkip, leftStep: null }] },
    ],
    [
      "seven on the team",
      {
        ...playthrough,
        stints: Array.from({ length: 7 }, (_, index) => ({
          ...marshtomp,
          id: `s${index}`,
          joinedStep: index + 1,
        })),
      },
    ],
  ])("drops a playthrough with %s and keeps the rest", (_, broken) => {
    store([broken, playthrough]);

    expect(loadPlaythroughs()).toEqual([playthrough]);
  });
});
