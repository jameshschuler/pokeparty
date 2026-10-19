import { beforeEach, describe, expect, it } from "vitest";
import type { Team } from "../types/team";
import { loadTeams, saveTeams } from "./team-storage";

const team: Team = { id: "a", pokemonIds: [25, 6], createdAt: 1, updatedAt: 2 };

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

  it.each([
    ["invalid JSON", "{nope"],
    ["a non-array", JSON.stringify({ teams: [team] })],
    ["null", "null"],
  ])("returns no teams for %s", (_, raw) => {
    localStorage.setItem("pokeparty:teams", raw);

    expect(loadTeams()).toEqual([]);
  });

  it("drops malformed teams and keeps valid ones", () => {
    const stored = [
      team,
      { ...team, id: 7 },
      { ...team, pokemonIds: [0] },
      { ...team, pokemonIds: [1, 2, 3, 4, 5, 6, 7] },
      null,
    ];
    localStorage.setItem("pokeparty:teams", JSON.stringify(stored));

    expect(loadTeams()).toEqual([team]);
  });
});
