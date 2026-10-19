import { beforeEach, describe, expect, it } from "vitest";
import { regularMembers } from "../test/members";
import type { Team } from "../types/team";
import { loadTeams, saveTeams } from "./team-storage";

const team: Team = {
  id: "a",
  members: [
    { pokemonId: 25, shiny: true },
    { pokemonId: 6, shiny: false },
  ],
  createdAt: 1,
  updatedAt: 2,
};

function store(value: unknown) {
  localStorage.setItem("pokeparty:teams", JSON.stringify(value));
}

describe("team storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns no teams when nothing is stored", () => {
    expect(loadTeams()).toEqual([]);
  });

  it("round-trips saved teams", () => {
    saveTeams([team]);

    expect(loadTeams()).toEqual([team]);
  });

  it("upgrades teams saved before shiny support", () => {
    store([{ id: "old", pokemonIds: [25, 6], createdAt: 1, updatedAt: 2 }]);

    expect(loadTeams()).toEqual([
      { id: "old", members: regularMembers(25, 6), createdAt: 1, updatedAt: 2 },
    ]);
  });

  it.each([
    ["invalid JSON", "{nope"],
    ["a non-array", JSON.stringify({ teams: [team] })],
    ["null", "null"],
  ])("returns no teams for %s", (_, raw) => {
    localStorage.setItem("pokeparty:teams", raw);

    expect(loadTeams()).toEqual([]);
  });

  it("drops malformed teams and keeps valid ones", () => {
    store([
      team,
      { ...team, id: 7 },
      { ...team, members: [{ pokemonId: 0, shiny: false }] },
      { ...team, members: [{ pokemonId: 25, shiny: "yes" }] },
      { ...team, members: [25] },
      { ...team, members: regularMembers(1, 2, 3, 4, 5, 6, 7) },
      { id: "legacy", pokemonIds: [0], createdAt: 1, updatedAt: 1 },
      { id: "empty", createdAt: 1, updatedAt: 1 },
      null,
    ]);

    expect(loadTeams()).toEqual([team]);
  });
});
