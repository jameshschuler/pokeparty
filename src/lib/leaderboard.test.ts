import { beforeEach, describe, expect, it } from "vitest";
import {
  addRun,
  BOARD_SIZE,
  bestRun,
  boardRuns,
  formatPlayedAt,
  loadRuns,
  roundRun,
  runRank,
  saveRuns,
  type QuizRun,
} from "./leaderboard";
import { quizPool } from "./pokedex";
import { createRng, startRound } from "./quiz";

function run(score: number, wrong: number, playedAt: number): QuizRun {
  return { mode: "sprite", clock: 60, score, wrong, streak: 0, playedAt };
}

describe("roundRun", () => {
  it("stamps the result with when the round started", () => {
    const round = startRound(
      quizPool("sprite"),
      createRng(1),
      { mode: "sprite", clock: "attack" },
      5_000,
    );

    expect(roundRun(round)).toEqual({
      mode: "sprite",
      clock: "attack",
      score: 0,
      wrong: 0,
      streak: 0,
      playedAt: 5_000,
    });
  });
});

describe("boardRuns", () => {
  it("ranks by score, then fewer wrong answers, then the earlier run", () => {
    const runs = [run(5, 0, 3), run(9, 2, 4), run(9, 1, 5), run(5, 0, 1)];

    expect(boardRuns(runs, "sprite", 60).map((r) => r.playedAt)).toEqual([
      5, 4, 1, 3,
    ]);
  });

  it("keeps each mode and clock on its own board", () => {
    const runs = [
      run(5, 0, 1),
      { ...run(9, 0, 2), clock: 30 as const },
      { ...run(9, 0, 3), mode: "dex" as const },
    ];

    expect(boardRuns(runs, "sprite", 60)).toEqual([run(5, 0, 1)]);
    expect(boardRuns(runs, "sprite", "attack")).toEqual([]);
  });
});

describe("bestRun", () => {
  it("returns the top run, or null for an empty board", () => {
    const runs = [run(3, 0, 1), run(7, 0, 2)];

    expect(bestRun(runs, "sprite", 60)).toEqual(run(7, 0, 2));
    expect(bestRun(runs, "dex", 60)).toBeNull();
  });
});

describe("addRun", () => {
  it("adds a run to its board", () => {
    expect(addRun([run(3, 0, 1)], run(5, 0, 2))).toHaveLength(2);
  });

  it("ignores a run it already has", () => {
    const runs = [run(3, 0, 1)];

    expect(addRun(runs, run(3, 0, 1))).toBe(runs);
  });

  it(`keeps only the top ${BOARD_SIZE} runs per board`, () => {
    const full = Array.from({ length: BOARD_SIZE }, (_, i) => run(i + 1, 0, i));
    const other = { ...run(1, 0, 99), mode: "dex" as const };
    const next = addRun([...full, other], run(20, 0, 50));

    expect(boardRuns(next, "sprite", 60)).toHaveLength(BOARD_SIZE);
    expect(next.some((r) => r.score === 1 && r.mode === "sprite")).toBe(false);
    expect(next).toContainEqual(other);
  });

  it("leaves the runs untouched when a run is too low for a full board", () => {
    const full = Array.from({ length: BOARD_SIZE }, (_, i) => run(5, 0, i));

    expect(addRun(full, run(1, 0, 50))).toBe(full);
  });

  it("doesn't save a run with no right answers", () => {
    const runs: QuizRun[] = [];

    expect(addRun(runs, run(0, 3, 1))).toBe(runs);
  });
});

describe("runRank", () => {
  const runs = [run(9, 0, 1), run(5, 0, 2), run(5, 1, 3)];

  it.each([
    [run(9, 0, 1), 1],
    [run(5, 0, 2), 2],
    [run(5, 1, 3), 3],
    [run(5, 1, 4), 4],
    [run(12, 0, 4), 1],
    [run(0, 0, 4), null],
  ])("%j -> %s, saved or not", (target, rank) => {
    expect(runRank(runs, target)).toBe(rank);
  });

  it("has no rank for a run that misses a full board", () => {
    const full = Array.from({ length: BOARD_SIZE }, (_, i) => run(5, 0, i));

    expect(runRank(full, run(1, 0, 50))).toBeNull();
  });
});

describe("formatPlayedAt", () => {
  it("shows the day the run was played", () => {
    const playedAt = new Date(2026, 9, 20, 15, 30).getTime();

    expect(formatPlayedAt(playedAt)).toMatch(/Oct.*20.*2026/);
  });
});

describe("leaderboard storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns no runs when nothing is stored", () => {
    expect(loadRuns()).toEqual([]);
  });

  it("round-trips saved runs", () => {
    const runs = [run(5, 1, 1), { ...run(2, 0, 2), clock: "attack" as const }];
    saveRuns(runs);

    expect(loadRuns()).toEqual(runs);
  });

  it.each([
    ["invalid JSON", "{nope"],
    ["a non-array", JSON.stringify({ runs: [] })],
  ])("returns no runs for %s", (_, raw) => {
    localStorage.setItem("pokeparty:quiz-runs", raw);

    expect(loadRuns()).toEqual([]);
  });

  it("drops malformed runs and keeps valid ones", () => {
    const valid = run(5, 1, 1);
    localStorage.setItem(
      "pokeparty:quiz-runs",
      JSON.stringify([
        valid,
        { ...valid, playedAt: "today" },
        { ...valid, mode: "shadow" },
        { ...valid, clock: 45 },
        { ...valid, score: -1 },
        { ...valid, streak: 9 },
        null,
        7,
      ]),
    );

    expect(loadRuns()).toEqual([valid]);
  });
});
