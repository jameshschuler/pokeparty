import { describe, expect, it } from "vitest";
import type { PokemonSummary, Region } from "../types/pokemon";
import {
  accuracy,
  advanceQuestion,
  answerQuestion,
  answerRound,
  buildQuestion,
  CHOICE_COUNT,
  createRng,
  drawAnswer,
  holdRound,
  isClockRunning,
  isPokemonHidden,
  isRoundSeconds,
  nextQuestion,
  releaseRound,
  parseQuizModeSearch,
  parseQuizSettings,
  pauseClock,
  remainingMs,
  resumeClock,
  showQuestion,
  startClock,
  startQuiz,
  startRound,
} from "./quiz";

function pokemon(id: number, region: Region): PokemonSummary {
  return {
    id,
    speciesId: id,
    name: `pokemon-${id}`,
    displayName: `Pokemon ${id}`,
    variant: null,
    region,
    legendary: false,
    searchText: `pokemon ${id}`,
  };
}

const kanto = [1, 2, 3, 4, 5, 6].map((id) => pokemon(id, "kanto"));
const johto = [152, 153, 154, 155, 156].map((id) => pokemon(id, "johto"));
const hisui = [899].map((id) => pokemon(id, "hisui"));
const pool = [...kanto, ...johto, ...hisui];

describe("createRng", () => {
  it("repeats the same sequence for the same seed", () => {
    const first = createRng(42);
    const second = createRng(42);

    expect([first(), first(), first()]).toEqual([second(), second(), second()]);
  });

  it("returns numbers in [0, 1)", () => {
    const rng = createRng(7);
    const values = Array.from({ length: 1000 }, rng);

    expect(values.every((value) => value >= 0 && value < 1)).toBe(true);
  });
});

describe("parseQuizSettings", () => {
  it.each([
    [
      { mode: "silhouette", seconds: "90" },
      { mode: "silhouette", seconds: 90 },
    ],
    [
      { mode: "sprite", seconds: 30 },
      { mode: "sprite", seconds: 30 },
    ],
    [{}, { mode: "sprite", seconds: 60 }],
    [
      { mode: "shadow", seconds: 45 },
      { mode: "sprite", seconds: 60 },
    ],
    [
      { mode: 7, seconds: "abc" },
      { mode: "sprite", seconds: 60 },
    ],
  ])("%j -> %j", (search, expected) => {
    expect(parseQuizSettings(search)).toEqual(expected);
  });
});

describe("parseQuizModeSearch", () => {
  it.each([
    [{ mode: "silhouette" }, "silhouette"],
    [{ mode: "sprite" }, "sprite"],
    [{}, "sprite"],
    [{ mode: "shadow" }, "sprite"],
  ])("%j -> %s", (search, mode) => {
    expect(parseQuizModeSearch(search)).toEqual({ mode });
  });
});

describe("isPokemonHidden", () => {
  it.each([
    ["silhouette", false, true],
    ["silhouette", true, false],
    ["sprite", false, false],
    ["sprite", true, false],
  ] as const)("%s, revealed %s -> %s", (mode, revealed, hidden) => {
    expect(isPokemonHidden(mode, revealed)).toBe(hidden);
  });
});

describe("isRoundSeconds", () => {
  it.each([
    [30, true],
    [60, true],
    [90, true],
    [45, false],
    [0, false],
  ])("%s -> %s", (seconds, expected) => {
    expect(isRoundSeconds(seconds)).toBe(expected);
  });
});

describe("drawAnswer", () => {
  it("deals every Pokémon once per cycle", () => {
    const rng = createRng(4);
    let draw = drawAnswer(pool, [], 0, null, rng);
    const dealt = [draw.answer.id];
    for (let step = 1; step < pool.length; step++) {
      draw = drawAnswer(pool, draw.deck, draw.deckIndex, draw.answer.id, rng);
      dealt.push(draw.answer.id);
    }

    expect([...dealt].sort((a, b) => a - b)).toEqual(
      pool.map((entry) => entry.id).sort((a, b) => a - b),
    );
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8])(
    "never repeats the last answer when a new cycle starts (seed %s)",
    (seed) => {
      const lastId = pool[0].id;
      const draw = drawAnswer(pool, pool, pool.length, lastId, createRng(seed));

      expect(draw.answer.id).not.toBe(lastId);
      expect(draw.deckIndex).toBe(1);
    },
  );

  it("keeps using the current deck until it runs out", () => {
    const draw = drawAnswer(pool, pool, 3, null, createRng(1));

    expect(draw).toMatchObject({ answer: pool[3], deck: pool, deckIndex: 4 });
  });
});

describe("buildQuestion", () => {
  it.each([1, 2, 3, 4, 5, 6, 7, 8])(
    "offers four different choices including the answer (seed %s)",
    (seed) => {
      const question = buildQuestion(kanto[0], pool, createRng(seed));
      const ids = question.choices.map((choice) => choice.id);

      expect(ids).toHaveLength(CHOICE_COUNT);
      expect(new Set(ids).size).toBe(CHOICE_COUNT);
      expect(ids).toContain(kanto[0].id);
    },
  );

  it("draws wrong choices from the answer's region when it can", () => {
    const question = buildQuestion(kanto[0], pool, createRng(3));

    expect(question.choices.every((choice) => choice.region === "kanto")).toBe(
      true,
    );
  });

  it("falls back to any region when the answer's region is too small", () => {
    const question = buildQuestion(hisui[0], pool, createRng(1));

    expect(question.choices).toHaveLength(CHOICE_COUNT);
    expect(question.choices.map((choice) => choice.id)).toContain(899);
  });
});

describe("quiz state", () => {
  const started = startQuiz(pool, createRng(5));
  const answerId = started.current.answer.id;
  const wrongId = started.current.choices.find(
    (choice) => choice.id !== answerId,
  )!.id;

  it("starts with an empty score and two different questions", () => {
    expect(started).toMatchObject({
      pickedId: null,
      correct: 0,
      wrong: 0,
      streak: 0,
      bestStreak: 0,
    });
    expect(started.upcoming.answer.id).not.toBe(answerId);
  });

  it("counts a right answer and grows the streak", () => {
    expect(answerQuestion(started, answerId)).toMatchObject({
      pickedId: answerId,
      correct: 1,
      wrong: 0,
      streak: 1,
      bestStreak: 1,
    });
  });

  it("counts a wrong answer and resets the streak but keeps the best", () => {
    const streaking = { ...started, streak: 4, bestStreak: 4 };

    expect(answerQuestion(streaking, wrongId)).toMatchObject({
      pickedId: wrongId,
      wrong: 1,
      streak: 0,
      bestStreak: 4,
    });
  });

  it("ignores a second answer to the same question", () => {
    const answered = answerQuestion(started, wrongId);

    expect(answerQuestion(answered, answerId)).toBe(answered);
  });

  it("never shows the same Pokémon twice in a row across cycles", () => {
    let state = startQuiz(pool, createRng(21));
    const rng = createRng(22);
    const answers = [state.current.answer.id];
    for (let step = 0; step < pool.length * 3; step++) {
      state = advanceQuestion(state, pool, rng);
      answers.push(state.current.answer.id);
    }

    expect(
      answers.every((id, index) => index === 0 || id !== answers[index - 1]),
    ).toBe(true);
  });

  it("moves the upcoming question up and clears the pick", () => {
    const answered = answerQuestion(started, answerId);
    const advanced = advanceQuestion(answered, pool, createRng(11));

    expect(advanced.current).toBe(started.upcoming);
    expect(advanced.pickedId).toBeNull();
    expect(advanced.correct).toBe(1);
  });
});

describe("round clock", () => {
  const waiting = startClock(30, 1_000);
  const running = resumeClock(waiting, 1_000);

  it("starts paused with the full round left", () => {
    expect(waiting).toEqual({ endsAt: 31_000, pausedAt: 1_000 });
    expect(remainingMs(waiting, 60_000)).toBe(30_000);
  });

  it("only spends time once it resumes", () => {
    const late = resumeClock(waiting, 4_000);

    expect(late).toEqual({ endsAt: 34_000, pausedAt: null });
    expect(remainingMs(late, 4_000)).toBe(30_000);
  });

  it("counts down while running and stops at zero", () => {
    expect(remainingMs(running, 11_000)).toBe(20_000);
    expect(remainingMs(running, 40_000)).toBe(0);
  });

  it("freezes while paused", () => {
    const paused = pauseClock(running, 11_000);

    expect(remainingMs(paused, 11_000)).toBe(20_000);
    expect(remainingMs(paused, 50_000)).toBe(20_000);
  });

  it("adds the paused time back when it resumes", () => {
    const resumed = resumeClock(pauseClock(running, 11_000), 11_600);

    expect(resumed).toEqual({ endsAt: 31_600, pausedAt: null });
    expect(remainingMs(resumed, 11_600)).toBe(20_000);
  });

  it("keeps the first pause time when paused twice", () => {
    const paused = pauseClock(pauseClock(running, 11_000), 11_400);

    expect(paused.pausedAt).toBe(11_000);
  });

  it("does nothing when resuming a running clock", () => {
    expect(resumeClock(running, 5_000)).toBe(running);
  });
});

describe("quiz round", () => {
  const waiting = startRound(pool, createRng(8), 30, 1_000);
  const shown = showQuestion(waiting, 2_000);
  const answerId = shown.quiz.current.answer.id;

  it("waits for the first question to be shown", () => {
    expect(waiting.shown).toBe(false);
    expect(remainingMs(waiting.clock, 60_000)).toBe(30_000);
  });

  it("ignores answers while waiting for the question", () => {
    expect(answerRound(waiting, answerId, 1_500)).toBe(waiting);
  });

  it("starts the clock when the question is shown", () => {
    expect(shown.shown).toBe(true);
    expect(remainingMs(shown.clock, 12_000)).toBe(20_000);
  });

  it("scores an answer and pauses the clock", () => {
    const answered = answerRound(shown, answerId, 7_000);

    expect(answered.quiz.correct).toBe(1);
    expect(answered.clock.pausedAt).toBe(7_000);
    expect(answered.shown).toBe(true);
  });

  it("ignores an answer after time is up", () => {
    expect(answerRound(shown, answerId, 32_000)).toBe(shown);
  });

  it("doesn't restart the clock while the answer is showing", () => {
    const answered = answerRound(shown, answerId, 7_000);

    expect(showQuestion(answered, 7_100)).toBe(answered);
  });

  it("waits for the next question after moving on", () => {
    const answered = answerRound(shown, answerId, 7_000);
    const next = nextQuestion(answered, pool, createRng(3), 7_300);

    expect(next.quiz.current).toBe(answered.quiz.upcoming);
    expect(next.shown).toBe(false);
    expect(remainingMs(showQuestion(next, 9_000).clock, 9_000)).toBe(25_000);
  });

  it("pauses the clock and blocks answers while on hold", () => {
    const held = holdRound(shown, 5_000);

    expect(isClockRunning(held)).toBe(false);
    expect(remainingMs(held.clock, 50_000)).toBe(27_000);
    expect(answerRound(held, answerId, 6_000)).toBe(held);
  });

  it("resumes the clock when released mid-question", () => {
    const released = releaseRound(holdRound(shown, 5_000), 9_000);

    expect(isClockRunning(released)).toBe(true);
    expect(remainingMs(released.clock, 9_000)).toBe(27_000);
  });

  it("keeps the clock paused when released during the reveal", () => {
    const answered = answerRound(shown, answerId, 7_000);
    const released = releaseRound(holdRound(answered, 7_100), 9_000);

    expect(isClockRunning(released)).toBe(false);
    expect(remainingMs(released.clock, 60_000)).toBe(25_000);
  });

  it("keeps the clock paused when released before the sprite loads", () => {
    const released = releaseRound(holdRound(waiting, 1_500), 3_000);

    expect(isClockRunning(released)).toBe(false);
    expect(remainingMs(showQuestion(released, 4_000).clock, 4_000)).toBe(
      30_000,
    );
  });

  it("ignores a second hold or a release without a hold", () => {
    const held = holdRound(shown, 5_000);

    expect(holdRound(held, 6_000)).toBe(held);
    expect(releaseRound(shown, 6_000)).toBe(shown);
  });

  it("doesn't start the clock if the sprite loads while on hold", () => {
    const loadedWhileHeld = showQuestion(holdRound(waiting, 1_500), 2_000);

    expect(isClockRunning(loadedWhileHeld)).toBe(false);
    expect(isClockRunning(releaseRound(loadedWhileHeld, 3_000))).toBe(true);
  });
});

describe("accuracy", () => {
  it.each([
    [0, 0, 0],
    [3, 1, 75],
    [2, 1, 67],
    [5, 0, 100],
    [0, 4, 0],
  ])("%s right, %s wrong -> %s%%", (correct, wrong, expected) => {
    expect(accuracy(correct, wrong)).toBe(expected);
  });
});
