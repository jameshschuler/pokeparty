import { beforeEach, describe, expect, it } from "vitest";
import {
  addRun,
  BOARD_SIZE,
  bestScore,
  boardRuns,
  dexRunScore,
  displayScore,
  formatPlayedAt,
  isDexRunScore,
  isMatchScore,
  isQuizRun,
  isSimonScore,
  loadRuns,
  roundRun,
  runRank,
  saveRuns,
  type DexRunScore,
  type GameRun,
  type QuizRun,
} from "./leaderboard";
import { answerDexRun, showDexQuestion, startDexRun } from "./dex-run";
import { quizPool } from "./pokedex";
import { startRound } from "./quiz";
import { createRng } from "./random";

function run(score: number, wrong: number, playedAt: number): QuizRun {
  return {
    game: "quiz",
    mode: "sprite",
    clock: 60,
    score,
    wrong,
    streak: 0,
    playedAt,
  };
}

const SPRITE_60 = { game: "quiz", mode: "sprite", clock: 60 } as const;

describe("roundRun", () => {
  it("stamps the result with when the round started", () => {
    const round = startRound(
      quizPool("sprite"),
      createRng(1),
      { mode: "sprite", clock: "attack" },
      5_000,
    );

    expect(roundRun(round)).toEqual({
      game: "quiz",
      mode: "sprite",
      clock: "attack",
      score: 0,
      wrong: 0,
      streak: 0,
      playedAt: 5_000,
    });
  });
});

function dexScore(score: number, playedAt: number): DexRunScore {
  return {
    game: "dex-run",
    range: 1,
    score,
    wrong: 3,
    reached: score + 1,
    playedAt,
  };
}

describe("dexRunScore", () => {
  it("scores right answers, lives lost and how far the run got", () => {
    const shown = showDexQuestion(startDexRun(2, createRng(3), 7_000), 7_500);
    const wrongKey = shown.question.choices.find(
      (choice) => choice.key !== shown.question.answerKey,
    )!.key;

    expect(dexRunScore(answerDexRun(shown, wrongKey, 8_000))).toEqual({
      game: "dex-run",
      range: 2,
      score: 0,
      wrong: 1,
      reached: 152,
      playedAt: 7_000,
    });
  });
});

describe("isQuizRun and isDexRunScore", () => {
  it.each([
    [run(5, 0, 1), true, false],
    [dexScore(5, 1), false, true],
  ])("%j -> quiz %s, dex run %s", (target, quiz, dexRun) => {
    expect(isQuizRun(target)).toBe(quiz);
    expect(isDexRunScore(target)).toBe(dexRun);
  });
});

describe("Simon scores", () => {
  it("keeps each level on its own board and saves them", () => {
    const easy = {
      game: "simon" as const,
      level: "easy" as const,
      score: 8,
      playedAt: 1,
    };
    const hard = { ...easy, level: "hard" as const, score: 3, playedAt: 2 };
    saveRuns([easy, hard, run(20, 0, 3)]);

    expect(boardRuns(loadRuns(), { game: "simon", level: "easy" })).toEqual([
      easy,
    ]);
    expect(isSimonScore(hard)).toBe(true);
    expect(isSimonScore(run(1, 0, 1))).toBe(false);
  });

  it("drops a stored Simon score with an unknown level", () => {
    localStorage.setItem(
      "pokeparty:quiz-runs",
      JSON.stringify([
        { game: "simon", level: "expert", score: 4, playedAt: 1 },
      ]),
    );

    expect(loadRuns()).toEqual([]);
  });
});

describe("Match scores", () => {
  function match(flips: number, timeMs: number, playedAt: number) {
    return {
      game: "match" as const,
      level: "easy" as const,
      flips,
      timeMs,
      playedAt,
    };
  }

  const EASY = { game: "match", level: "easy" } as const;

  it("ranks fewer flips first, then the faster time, then the earlier run", () => {
    const runs = [
      match(20, 30_000, 1),
      match(14, 50_000, 2),
      match(14, 40_000, 3),
      match(14, 40_000, 4),
    ];

    expect(boardRuns(runs, EASY).map((run) => run.playedAt)).toEqual([
      3, 4, 2, 1,
    ]);
    expect(bestScore(runs, EASY)).toBe(14);
  });

  it("saves every finished game and reads it back", () => {
    saveRuns(addRun([], match(12, 9_000, 1)));

    expect(loadRuns()).toEqual([match(12, 9_000, 1)]);
    expect(isMatchScore(loadRuns()[0])).toBe(true);
    expect(displayScore(match(12, 9_000, 1))).toBe(12);
  });

  it.each([
    ["more flips than a result can hold", match(1_000, 9_000, 1)],
    ["a game longer than a day", match(12, 25 * 60 * 60 * 1000, 1)],
  ])("doesn't save %s, since it couldn't be loaded back", (_, long) => {
    const runs: GameRun[] = [];

    expect(addRun(runs, long)).toBe(runs);
  });

  it("drops a stored Match score that couldn't happen", () => {
    localStorage.setItem(
      "pokeparty:quiz-runs",
      JSON.stringify([{ ...match(12, 9_000, 1), flips: 3 }]),
    );

    expect(loadRuns()).toEqual([]);
  });
});

describe("game boards", () => {
  it("keeps Dex Run ranges apart from each other and from the quiz", () => {
    const runs = [
      run(50, 0, 1),
      dexScore(10, 2),
      { ...dexScore(30, 3), range: "national" as const },
    ];

    expect(boardRuns(runs, { game: "dex-run", range: 1 })).toEqual([
      dexScore(10, 2),
    ]);
    expect(bestScore(runs, { game: "dex-run", range: "national" })).toBe(30);
    expect(boardRuns(runs, SPRITE_60)).toEqual([run(50, 0, 1)]);
  });
});

describe("boardRuns", () => {
  it("ranks by score, then fewer wrong answers, then the earlier run", () => {
    const runs = [run(5, 0, 3), run(9, 2, 4), run(9, 1, 5), run(5, 0, 1)];

    expect(boardRuns(runs, SPRITE_60).map((r) => r.playedAt)).toEqual([
      5, 4, 1, 3,
    ]);
  });

  it("keeps each mode and clock on its own board", () => {
    const runs = [
      run(5, 0, 1),
      { ...run(9, 0, 2), clock: 30 as const },
      { ...run(9, 0, 3), mode: "dex" as const },
    ];

    expect(boardRuns(runs, SPRITE_60)).toEqual([run(5, 0, 1)]);
    expect(boardRuns(runs, { ...SPRITE_60, clock: "attack" })).toEqual([]);
  });
});

describe("bestScore", () => {
  it("returns the top run, or null for an empty board", () => {
    const runs = [run(3, 0, 1), run(7, 0, 2)];

    expect(bestScore(runs, SPRITE_60)).toBe(7);
    expect(bestScore(runs, { ...SPRITE_60, mode: "dex" })).toBeNull();
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

    expect(boardRuns(next, SPRITE_60)).toHaveLength(BOARD_SIZE);
    expect(
      next.filter((r) => r.game === "quiz" && r.mode === "sprite"),
    ).toHaveLength(BOARD_SIZE);
    expect(next.some((r) => displayScore(r) === 1 && r !== other)).toBe(false);
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

  it("reads quiz runs saved before there were other games", () => {
    const legacy = {
      mode: "sprite",
      clock: 60,
      score: 5,
      wrong: 1,
      streak: 0,
      playedAt: 1,
    };
    localStorage.setItem("pokeparty:quiz-runs", JSON.stringify([legacy]));

    expect(loadRuns()).toEqual([run(5, 1, 1)]);
  });

  it("round-trips Dex Run scores and drops malformed ones", () => {
    const valid = dexScore(40, 1);
    localStorage.setItem(
      "pokeparty:quiz-runs",
      JSON.stringify([
        valid,
        { ...valid, range: 10 },
        { ...valid, score: 152 },
        { ...valid, wrong: 4 },
        { ...valid, reached: 0 },
        { ...valid, reached: 152 },
        { ...valid, score: 40, reached: 30 },
        { ...valid, game: "simon" },
      ]),
    );

    expect(loadRuns()).toEqual([valid]);
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
