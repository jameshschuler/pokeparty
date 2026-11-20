import { describe, expect, it } from "vitest";
import type { TeamStint } from "../types/playthrough";
import {
  addMember,
  createPlaythrough,
  currentLevel,
  currentPokemonId,
  currentTeam,
  fixLevel,
  isValidLevel,
  lastStep,
  parseLevel,
  playthroughTitle,
  pokemonIdAt,
  speciesName,
  stintName,
  swapOut,
  timelineEvents,
  timelineSteps,
  undoLastStep,
  updateMember,
  type NewMember,
  type StintResult,
} from "./playthrough";

function stint(overrides: Partial<TeamStint>): TeamStint {
  return {
    id: `stint-${overrides.pokemonId ?? 0}`,
    pokemonId: 19,
    shiny: false,
    nickname: null,
    joinedLevel: 3,
    joinedStep: 1,
    updates: [],
    leftLevel: null,
    leftStep: null,
    ...overrides,
  };
}

function member(pokemonId: number, level: number | null): NewMember {
  return { pokemonId, shiny: false, nickname: "", level };
}

function stintsOf(result: StintResult): TeamStint[] {
  if (!result.ok) {
    throw new Error(`Expected ok, got ${result.error}`);
  }

  return result.stints;
}

const fullTeam = [1, 2, 3, 4, 5, 6].map((pokemonId, index) =>
  stint({ id: `s${pokemonId}`, pokemonId, joinedStep: index + 1 }),
);

describe("isValidLevel", () => {
  it.each([
    [1, true],
    [100, true],
    [0, false],
    [101, false],
    [12.5, false],
    [NaN, false],
  ])("treats %s as %s", (level, valid) => {
    expect(isValidLevel(level)).toBe(valid);
  });
});

describe("parseLevel", () => {
  it.each([
    ["12", 12],
    [" 7 ", 7],
    ["", null],
    ["   ", null],
  ])("reads %j as %s", (text, level) => {
    expect(parseLevel(text)).toBe(level);
  });

  it("keeps bad input so it fails the level check", () => {
    expect(parseLevel("abc")).toBeNaN();
  });
});

describe("createPlaythrough", () => {
  it("starts with an empty team and a trimmed name", () => {
    expect(createPlaythrough("emerald", "  Nuzlocke #2 ", 5)).toEqual({
      id: expect.any(String),
      gameId: "emerald",
      name: "Nuzlocke #2",
      stints: [],
      createdAt: 5,
      updatedAt: 5,
    });
  });

  it("stores a blank name as no name", () => {
    expect(createPlaythrough("emerald", "   ", 5).name).toBeNull();
  });
});

describe("addMember", () => {
  it("adds the first member at step 1", () => {
    const stints = stintsOf(
      addMember([], { ...member(258, 5), nickname: " Mudkip Jr. " }),
    );

    expect(stints).toEqual([
      {
        id: expect.any(String),
        pokemonId: 258,
        shiny: false,
        nickname: "Mudkip Jr.",
        joinedLevel: 5,
        joinedStep: 1,
        updates: [],
        leftLevel: null,
        leftStep: null,
      },
    ]);
  });

  it("gives each change the next step", () => {
    const first = stintsOf(addMember([], member(258, 5)));
    const second = stintsOf(addMember(first, member(263, 3)));

    expect(second.map((entry) => entry.joinedStep)).toEqual([1, 2]);
  });

  it("lets a member join without a level", () => {
    const [added] = stintsOf(addMember([], member(258, null)));

    expect(added.joinedLevel).toBeNull();
    expect(currentLevel(added)).toBeNull();
  });

  it("lets the same species join twice", () => {
    const first = stintsOf(addMember([], member(19, 3)));

    expect(stintsOf(addMember(first, member(19, 4)))).toHaveLength(2);
  });

  it.each<[string, TeamStint[], NewMember, string]>([
    ["at six", fullTeam, member(7, 5), "team-full"],
    ["below level 1", [], member(7, 0), "invalid-level"],
    ["above level 100", [], member(7, 101), "invalid-level"],
  ])("fails %s", (_, stints, newMember, error) => {
    expect(addMember(stints, newMember)).toEqual({ ok: false, error });
  });

  it("counts only the current team toward six", () => {
    const stints = [
      ...fullTeam.slice(1),
      stint({ id: "gone", leftLevel: 5, leftStep: 7 }),
    ];

    expect(addMember(stints, member(7, 5)).ok).toBe(true);
  });
});

describe("swapOut", () => {
  const raticate = stint({ id: "rat", pokemonId: 20, joinedLevel: 20 });

  it("records the leave and the replacement as one step", () => {
    const stints = stintsOf(swapOut([raticate], "rat", 32, member(58, 30)));

    expect(stints[0]).toMatchObject({ leftLevel: 32, leftStep: 2 });
    expect(stints[1]).toMatchObject({ pokemonId: 58, joinedStep: 2 });
    expect(timelineSteps(stints)).toHaveLength(2);
  });

  it("lets a member leave with no replacement", () => {
    const stints = stintsOf(swapOut([raticate], "rat", 32, null));

    expect(stints).toEqual([{ ...raticate, leftLevel: 32, leftStep: 2 }]);
    expect(currentTeam(stints)).toEqual([]);
  });

  it("allows leaving at the join level", () => {
    expect(swapOut([raticate], "rat", 20, null).ok).toBe(true);
  });

  it("swaps on a full team", () => {
    const stints = stintsOf(swapOut(fullTeam, "s1", 10, member(7, 9)));

    expect(currentTeam(stints)).toHaveLength(6);
  });

  it.each<[string, string, number, NewMember | null, string]>([
    ["below the join level", "rat", 19, null, "level-dropped"],
    ["at level 101", "rat", 101, null, "invalid-level"],
    ["with a bad replacement level", "rat", 32, member(58, 0), "invalid-level"],
    ["for someone not on the team", "nope", 32, null, "not-on-team"],
  ])("fails %s", (_, stintId, level, replacement, error) => {
    expect(swapOut([raticate], stintId, level, replacement)).toEqual({
      ok: false,
      error,
    });
  });

  it("fails for a member who already left", () => {
    const gone = { ...raticate, leftLevel: 25, leftStep: 2 };

    expect(swapOut([gone], "rat", 30, null)).toEqual({
      ok: false,
      error: "not-on-team",
    });
  });
});

describe("undoLastStep", () => {
  it("removes a whole swap", () => {
    const before = [stint({ id: "rat", pokemonId: 20, joinedLevel: 20 })];
    const after = stintsOf(swapOut(before, "rat", 32, member(58, 30)));

    expect(undoLastStep(after)).toEqual(before);
  });

  it("removes the latest add", () => {
    const before = fullTeam.slice(0, 2);

    expect(undoLastStep(fullTeam.slice(0, 3))).toEqual(before);
  });

  it("does nothing on an empty playthrough", () => {
    expect(undoLastStep([])).toEqual([]);
  });
});

describe("updateMember", () => {
  const elekid = stint({ id: "zap", pokemonId: 239, joinedLevel: 12 });

  it("records an evolution as its own step", () => {
    const stints = stintsOf(updateMember([elekid], "zap", 30, 125));

    expect(stints[0].updates).toEqual([{ step: 2, level: 30, pokemonId: 125 }]);
    expect(currentPokemonId(stints[0])).toBe(125);
    expect(currentLevel(stints[0])).toBe(30);
  });

  it("records a level-up without an evolution", () => {
    const stints = stintsOf(updateMember([elekid], "zap", 20, 239));

    expect(currentPokemonId(stints[0])).toBe(239);
    expect(currentLevel(stints[0])).toBe(20);
  });

  it("keeps the earlier form for earlier steps", () => {
    const [updated] = stintsOf(updateMember([elekid], "zap", 30, 125));

    expect(pokemonIdAt(updated, 1)).toBe(239);
    expect(pokemonIdAt(updated, 2)).toBe(125);
  });

  it.each<[string, string, number, number, string]>([
    ["with nothing changed", "zap", 12, 239, "no-change"],
    ["below the current level", "zap", 11, 125, "level-dropped"],
    ["at level 101", "zap", 101, 125, "invalid-level"],
    ["for someone not on the team", "nope", 30, 125, "not-on-team"],
  ])("fails %s", (_, stintId, level, pokemonId, error) => {
    expect(updateMember([elekid], stintId, level, pokemonId)).toEqual({
      ok: false,
      error,
    });
  });

  it("checks only the levels that are set", () => {
    const unknown = { ...elekid, joinedLevel: null };

    expect(updateMember([unknown], "zap", 5, 239).ok).toBe(true);
    expect(swapOut([unknown], "zap", 3, null).ok).toBe(true);
  });

  it("won't let a member leave below its updated level", () => {
    const stints = stintsOf(updateMember([elekid], "zap", 30, 125));

    expect(swapOut(stints, "zap", 25, null)).toEqual({
      ok: false,
      error: "level-dropped",
    });
  });

  it("is removed by undo", () => {
    const stints = stintsOf(updateMember([elekid], "zap", 30, 125));

    expect(undoLastStep(stints)).toEqual([elekid]);
  });
});

describe("fixLevel", () => {
  const gone = stint({
    id: "rat",
    joinedLevel: 20,
    updates: [{ step: 2, level: 25, pokemonId: 20 }],
    leftLevel: 32,
    leftStep: 3,
  });

  it.each<[string, number, number, Partial<TeamStint>]>([
    ["join", 1, 18, { joinedLevel: 18 }],
    ["join", 1, 25, { joinedLevel: 25 }],
    ["update", 2, 30, { updates: [{ step: 2, level: 30, pokemonId: 20 }] }],
    ["leave", 3, 40, { leftLevel: 40 }],
  ])("changes the %s level at step %s to %s", (_, step, level, change) => {
    expect(stintsOf(fixLevel([gone], "rat", step, level))).toEqual([
      { ...gone, ...change },
    ]);
  });

  it.each<[string, string, number, number, string]>([
    ["a join above the next level", "rat", 1, 26, "level-dropped"],
    ["an update above the leave level", "rat", 2, 33, "level-dropped"],
    ["a leave below the update", "rat", 3, 24, "level-dropped"],
    ["level 0", "rat", 1, 0, "invalid-level"],
    ["a step the member has no level at", "rat", 4, 10, "not-found"],
    ["an unknown member", "nope", 1, 10, "not-found"],
  ])("rejects %s", (_, stintId, step, level, error) => {
    expect(fixLevel([gone], stintId, step, level)).toEqual({
      ok: false,
      error,
    });
  });
});

describe("timelineSteps", () => {
  it("has no steps for an empty playthrough", () => {
    expect(timelineSteps([])).toEqual([]);
  });

  it("lists each step oldest first with who left and who joined", () => {
    const rat = stint({ id: "rat", pokemonId: 20 });
    const added = stintsOf(addMember([rat], member(16, 4)));
    const swapped = stintsOf(swapOut(added, "rat", 32, member(58, 30)));
    const [left, pidgey, growlithe] = swapped;

    expect(timelineSteps(swapped)).toEqual([
      { step: 1, left: [], changed: [], joined: [left] },
      { step: 2, left: [], changed: [], joined: [pidgey] },
      { step: 3, left: [left], changed: [], joined: [growlithe] },
    ]);
  });
});

describe("timelineEvents", () => {
  const rat = stint({ id: "rat", pokemonId: 20 });

  it("turns each step into one event", () => {
    const added = stintsOf(addMember([rat], member(16, 4)));
    const updated = stintsOf(updateMember(added, "rat", 30, 20));
    const swapped = stintsOf(swapOut(updated, "rat", 32, member(58, 30)));
    const removed = stintsOf(swapOut(swapped, swapped[2].id, 31, null));

    expect(timelineEvents(removed).map((event) => event.kind)).toEqual([
      "joined",
      "joined",
      "changed",
      "swap",
      "left",
    ]);
  });

  it("skips steps with nothing in them", () => {
    expect(timelineEvents([{ ...rat, joinedStep: 3 }])).toEqual([
      { kind: "joined", step: 3, stint: { ...rat, joinedStep: 3 } },
    ]);
  });

  it("keeps every change when a step has more than one", () => {
    const twins = [rat, { ...rat, id: "rat2" }];

    expect(timelineEvents(twins).map((event) => event.kind)).toEqual([
      "joined",
      "joined",
    ]);
  });
});

describe("timeline changes", () => {
  it("lists an evolution with the form it evolved from", () => {
    const elekid = stint({ id: "zap", pokemonId: 239 });
    const [updated] = stintsOf(updateMember([elekid], "zap", 30, 125));

    expect(timelineSteps([updated])[1]).toEqual({
      step: 2,
      left: [],
      changed: [{ stint: updated, update: updated.updates[0], from: 239 }],
      joined: [],
    });
  });
});

describe("lastStep", () => {
  it("starts at step 0", () => {
    expect(lastStep([])).toBe(0);
  });

  it("finds the latest join, update or leave", () => {
    expect(
      lastStep([
        stint({ id: "a", joinedStep: 1, leftLevel: 9, leftStep: 3 }),
        stint({ id: "b", joinedStep: 2 }),
      ]),
    ).toBe(3);
    expect(
      lastStep([
        stint({
          joinedStep: 1,
          updates: [{ step: 4, level: 9, pokemonId: 19 }],
        }),
      ]),
    ).toBe(4);
  });
});

describe("names", () => {
  const playthrough = createPlaythrough("emerald", "", 1);

  it("titles a playthrough by its name", () => {
    expect(playthroughTitle({ ...playthrough, name: "Nuzlocke #2" })).toBe(
      "Nuzlocke #2",
    );
  });

  it("titles an unnamed playthrough by its game", () => {
    expect(playthroughTitle(playthrough)).toBe("Emerald");
  });

  it("names a stint by its nickname", () => {
    expect(stintName(stint({ pokemonId: 25, nickname: "Sparky" }))).toBe(
      "Sparky",
    );
  });

  it("names a stint without a nickname by its species", () => {
    expect(stintName(stint({ pokemonId: 25 }))).toBe("Pikachu");
  });

  it("names a stint by its latest form", () => {
    const evolved = stint({
      pokemonId: 239,
      updates: [{ step: 2, level: 30, pokemonId: 125 }],
    });

    expect(stintName(evolved)).toBe("Electabuzz");
    expect(stintName(evolved, 239)).toBe("Elekid");
  });

  it("names a form by its species and form", () => {
    expect(speciesName(10091)).toBe("Alolan Rattata");
  });

  it("falls back for an unknown Pokémon", () => {
    expect(speciesName(99999)).toBe("Unknown Pokémon");
  });
});
