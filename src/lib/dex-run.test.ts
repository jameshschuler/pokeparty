import { describe, expect, it } from "vitest";
import {
  advanceDexRun,
  answerDexRun,
  clearedRange,
  describeDexAnswer,
  dexRangeBounds,
  dexRangePool,
  DEX_RUN_ANSWER_MS,
  DEX_RUN_LIVES,
  DEX_RUN_MISS_REVEAL_MS,
  formatDexBounds,
  formatDexRange,
  holdDexRun,
  isRevealed,
  parseDexRange,
  reachedNumber,
  releaseDexRun,
  revealMs,
  showDexQuestion,
  skipDexQuestion,
  startDexRun,
  timeOutDexQuestion,
  type DexRun,
} from "./dex-run";
import { createRng, FEEDBACK_MS, remainingMs } from "./quiz";

const started = startDexRun(1, createRng(4), 1_000);
const shown = showDexQuestion(started, 2_000);
const answerKey = shown.question.answerKey;
const wrongKey = shown.question.choices.find(
  (choice) => choice.key !== answerKey,
)!.key;

function lastQuestion(run: DexRun): DexRun {
  return { ...run, index: run.pool.length - 1, upcoming: null };
}

describe("parseDexRange", () => {
  it.each([
    ["national", "national"],
    [1, 1],
    ["9", 9],
    [0, null],
    [10, null],
    ["kanto", null],
    ["", null],
    [undefined, null],
  ])("%j -> %j", (value, expected) => {
    expect(parseDexRange(value)).toBe(expected);
  });
});

describe("dexRangePool", () => {
  it.each([
    ["national", 1, 1025],
    [1, 1, 151],
    [2, 152, 251],
    [7, 722, 809],
    [8, 810, 905],
    [9, 906, 1025],
  ] as const)("%s covers #%s to #%s in dex order", (range, first, last) => {
    const pool = dexRangePool(range);

    expect(pool[0].speciesId).toBe(first);
    expect(pool.at(-1)!.speciesId).toBe(last);
    expect(pool).toHaveLength(last - first + 1);
    expect(dexRangeBounds(range)).toEqual({ first, last });
  });

  it("leaves out alternate and regional forms", () => {
    expect(
      dexRangePool("national").every(
        (pokemon) => pokemon.id === pokemon.speciesId,
      ),
    ).toBe(true);
  });
});

describe("formatting", () => {
  it.each([
    ["national", "National Dex", "#0001–#1025"],
    [1, "Gen 1 · Kanto", "#0001–#0151"],
    [8, "Gen 8 · Galar", "#0810–#0905"],
  ] as const)("%s -> %s, %s", (range, label, bounds) => {
    expect(formatDexRange(range)).toBe(label);
    expect(formatDexBounds(range)).toBe(bounds);
  });
});

describe("startDexRun", () => {
  it("starts at the first number of the range with full lives", () => {
    const johto = startDexRun(2, createRng(1), 0);

    expect(johto.question.answer.speciesId).toBe(152);
    expect(johto.upcoming!.answer.speciesId).toBe(153);
    expect(johto.lives).toBe(DEX_RUN_LIVES);
    expect(reachedNumber(johto)).toBe(152);
  });

  it("offers four sprites from the same range, one of them right", () => {
    const { choices, answerKey: key } = started.question;
    const rangeIds = new Set(dexRangePool(1).map((pokemon) => pokemon.id));

    expect(choices).toHaveLength(4);
    expect(choices.every((choice) => choice.kind === "sprite")).toBe(true);
    expect(choices.map((choice) => choice.key)).toContain(key);
    expect(
      choices.every(
        (choice) => choice.kind === "sprite" && rangeIds.has(choice.pokemonId),
      ),
    ).toBe(true);
  });

  it("holds the clock until the sprites are shown", () => {
    expect(remainingMs(started.clock, 50_000)).toBe(DEX_RUN_ANSWER_MS);
    expect(remainingMs(shown.clock, 5_000)).toBe(DEX_RUN_ANSWER_MS - 3_000);
  });
});

describe("answerDexRun", () => {
  it("counts a right answer and pauses the clock", () => {
    const answered = answerDexRun(shown, answerKey, 4_000);

    expect(answered.correct).toBe(1);
    expect(answered.lives).toBe(DEX_RUN_LIVES);
    expect(answered.clock.pausedAt).toBe(4_000);
    expect(isRevealed(answered)).toBe(true);
  });

  it("takes a life for a wrong answer but keeps the question open", () => {
    const answered = answerDexRun(shown, wrongKey, 4_000);

    expect(answered.correct).toBe(0);
    expect(answered.lives).toBe(DEX_RUN_LIVES - 1);
    expect(answered.ruledOutKeys).toEqual([wrongKey]);
    expect(isRevealed(answered)).toBe(false);
    expect(answered.clock.pausedAt).toBeNull();
    expect(remainingMs(answered.clock, 5_000)).toBe(DEX_RUN_ANSWER_MS - 3_000);
  });

  it("ignores a second pick of a ruled-out choice", () => {
    const answered = answerDexRun(shown, wrongKey, 4_000);

    expect(answerDexRun(answered, wrongKey, 4_500)).toBe(answered);
  });

  it("accepts the right answer after a wrong one", () => {
    const retried = answerDexRun(
      answerDexRun(shown, wrongKey, 4_000),
      answerKey,
      5_000,
    );

    expect(retried.correct).toBe(1);
    expect(retried.lives).toBe(DEX_RUN_LIVES - 1);
    expect(isRevealed(retried)).toBe(true);
  });

  it("reveals the answer when the last life goes after earlier misses", () => {
    const [first, second] = shown.question.choices
      .map((choice) => choice.key)
      .filter((key) => key !== answerKey);
    const out = answerDexRun(
      answerDexRun({ ...shown, lives: 2 }, first, 3_000),
      second,
      4_000,
    );

    expect(out.lives).toBe(0);
    expect(out.ruledOutKeys).toEqual([first, second]);
    expect(isRevealed(out)).toBe(true);
    expect(out.clock.pausedAt).toBe(4_000);
  });

  it("charges a time-out after a wrong guess and reveals the answer", () => {
    const timedOut = timeOutDexQuestion(
      answerDexRun(shown, wrongKey, 4_000),
      12_000,
    );

    expect(timedOut.lives).toBe(DEX_RUN_LIVES - 2);
    expect(timedOut.ruledOutKeys).toEqual([wrongKey]);
    expect(describeDexAnswer(timedOut)).toBe("Too slow! #0001 is Bulbasaur!");
  });

  it("reveals the answer when the last life goes", () => {
    const answered = answerDexRun({ ...shown, lives: 1 }, wrongKey, 4_000);

    expect(answered.lives).toBe(0);
    expect(isRevealed(answered)).toBe(true);
    expect(revealMs(answered)).toBe(DEX_RUN_MISS_REVEAL_MS);
  });

  it.each([
    ["before the sprites load", started, 1_500],
    ["while on hold", holdDexRun(shown, 3_000), 4_000],
    ["after time runs out", shown, 2_000 + DEX_RUN_ANSWER_MS],
    ["after an answer", answerDexRun(shown, answerKey, 3_000), 4_000],
  ])("ignores an answer %s", (_, run, now) => {
    expect(answerDexRun(run, wrongKey, now)).toBe(run);
  });
});

describe("timeOutDexQuestion", () => {
  it("does nothing while time is left", () => {
    expect(timeOutDexQuestion(shown, 11_999)).toBe(shown);
  });

  it("reveals the answer and takes a life when time runs out", () => {
    const timedOut = timeOutDexQuestion(shown, 12_000);

    expect(timedOut.timedOut).toBe(true);
    expect(timedOut.lives).toBe(DEX_RUN_LIVES - 1);
    expect(describeDexAnswer(timedOut)).toBe("Too slow! #0001 is Bulbasaur!");
  });

  it("does nothing once the question is answered", () => {
    const answered = answerDexRun(shown, answerKey, 4_000);

    expect(timeOutDexQuestion(answered, 30_000)).toBe(answered);
  });
});

describe("advanceDexRun", () => {
  it("moves to the next number with a fresh clock", () => {
    const answered = answerDexRun(
      answerDexRun(shown, wrongKey, 3_000),
      answerKey,
      4_000,
    );
    const next = advanceDexRun(answered, createRng(2), 5_000);

    expect(next.question).toBe(answered.upcoming);
    expect(next.question.answer.speciesId).toBe(2);
    expect(next.pickedKey).toBeNull();
    expect(next.ruledOutKeys).toEqual([]);
    expect(next.shown).toBe(false);
    expect(remainingMs(next.clock, 60_000)).toBe(DEX_RUN_ANSWER_MS);
  });

  it("ends the run when the last life is lost", () => {
    const lastLife = answerDexRun({ ...shown, lives: 1 }, wrongKey, 4_000);
    const ended = advanceDexRun(lastLife, createRng(2), 5_000);

    expect(ended.finished).toBe(true);
    expect(clearedRange(ended)).toBe(false);
  });

  it("clears the range after the last number", () => {
    const answered = answerDexRun(lastQuestion(shown), answerKey, 4_000);
    const ended = advanceDexRun(answered, createRng(2), 5_000);

    expect(ended.finished).toBe(true);
    expect(clearedRange(ended)).toBe(true);
    expect(reachedNumber(ended)).toBe(151);
  });
});

describe("skipDexQuestion", () => {
  it("moves on without costing a life before the sprites load", () => {
    const skipped = skipDexQuestion(started, createRng(2), 1_500);

    expect(skipped.index).toBe(1);
    expect(skipped.lives).toBe(DEX_RUN_LIVES);
  });

  it("does nothing once the question is shown", () => {
    expect(skipDexQuestion(shown, createRng(2), 3_000)).toBe(shown);
  });
});

describe("hold and release", () => {
  it("pauses the clock while on hold", () => {
    const released = releaseDexRun(holdDexRun(shown, 3_000), 20_000);

    expect(remainingMs(released.clock, 20_000)).toBe(DEX_RUN_ANSWER_MS - 1_000);
  });
});

describe("revealMs", () => {
  it("shows a miss for longer than a right answer", () => {
    expect(revealMs(answerDexRun(shown, answerKey, 3_000))).toBe(FEEDBACK_MS);
    expect(revealMs(timeOutDexQuestion(shown, 12_000))).toBe(
      DEX_RUN_MISS_REVEAL_MS,
    );
  });
});
