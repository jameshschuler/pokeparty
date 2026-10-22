import { describe, expect, it } from "vitest";
import type { PokemonSummary, Region } from "../types/pokemon";
import {
  accuracy,
  advanceQuestion,
  answerQuestion,
  answerRound,
  buildQuestion,
  CHOICE_COUNT,
  describeAnswer,
  drawAnswer,
  clockCapacityMs,
  formatClockDelta,
  formatClockSetting,
  holdRound,
  isClockRunning,
  isRoundOver,
  NEARBY_DEX_RANGE,
  isPokemonHidden,
  parseClockSetting,
  nextQuestion,
  releaseRound,
  parseQuizModeSearch,
  parseQuizSettings,
  pauseClock,
  questionSpriteIds,
  remainingMs,
  resumeClock,
  showQuestion,
  startClock,
  startQuiz,
  startRound,
  TIME_ATTACK_BONUS_MS,
  TIME_ATTACK_MAX_MS,
  WRONG_ANSWER_PENALTY_MS,
  type QuizChoice,
} from "./quiz";
import { createRng } from "./random";

function pokemon(id: number, region: Region): PokemonSummary {
  return {
    id,
    speciesId: id,
    name: `pokemon-${id}`,
    displayName: `Pokemon ${id}`,
    variant: null,
    region,
    legendary: false,
    regional: false,
    searchText: `pokemon ${id}`,
  };
}

const kanto = [1, 2, 3, 4, 5, 6].map((id) => pokemon(id, "kanto"));
const johto = [152, 153, 154, 155, 156].map((id) => pokemon(id, "johto"));
const hisui = [899].map((id) => pokemon(id, "hisui"));
const pool = [...kanto, ...johto, ...hisui];

describe("parseQuizSettings", () => {
  it.each([
    [
      { mode: "silhouette", clock: "90" },
      { mode: "silhouette", clock: 90 },
    ],
    [
      { mode: "sprite", clock: 30 },
      { mode: "sprite", clock: 30 },
    ],
    [
      { mode: "dex", clock: "attack" },
      { mode: "dex", clock: "attack" },
    ],
    [{}, { mode: "sprite", clock: 60 }],
    [
      { mode: "shadow", clock: 45 },
      { mode: "sprite", clock: 60 },
    ],
    [
      { mode: 7, clock: "abc" },
      { mode: "sprite", clock: 60 },
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
    ["region", false, false],
    ["dex", false, false],
  ] as const)("%s, answered %s -> %s", (mode, answered, hidden) => {
    const started = startQuiz(pool, createRng(1), mode);
    const state = answered
      ? answerQuestion(started, started.current.answerKey)
      : started;

    expect(isPokemonHidden(state)).toBe(hidden);
  });
});

describe("parseClockSetting", () => {
  it.each([
    [30, 30],
    ["60", 60],
    [90, 90],
    ["attack", "attack"],
    [45, null],
    [0, null],
    ["", null],
    ["Attack", null],
    [undefined, null],
  ])("%j -> %j", (value, expected) => {
    expect(parseClockSetting(value)).toBe(expected);
  });
});

describe("clockCapacityMs", () => {
  it.each([
    [30, 30_000],
    [90, 90_000],
    ["attack", TIME_ATTACK_MAX_MS],
  ] as const)("%s -> %s", (setting, expected) => {
    expect(clockCapacityMs(setting)).toBe(expected);
  });
});

describe("formatClockSetting", () => {
  it.each([
    [30, "30s"],
    [60, "60s"],
    ["attack", "Time attack"],
  ] as const)("%s -> %s", (setting, expected) => {
    expect(formatClockSetting(setting)).toBe(expected);
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
  const byId = new Map(pool.map((pokemon) => [String(pokemon.id), pokemon]));

  it.each([1, 2, 3, 4, 5, 6, 7, 8])(
    "offers four different names including the answer (seed %s)",
    (seed) => {
      const question = buildQuestion("sprite", kanto[0], pool, createRng(seed));
      const keys = question.choices.map((choice) => choice.key);

      expect(question.answerKey).toBe("1");
      expect(keys).toHaveLength(CHOICE_COUNT);
      expect(new Set(keys).size).toBe(CHOICE_COUNT);
      expect(keys).toContain("1");
      expect(question.choices.find((choice) => choice.key === "1")?.label).toBe(
        "Pokemon 1",
      );
    },
  );

  it("draws wrong names from the answer's region when it can", () => {
    const question = buildQuestion("sprite", kanto[0], pool, createRng(3));

    expect(
      question.choices.every(
        (choice) => byId.get(choice.key)?.region === "kanto",
      ),
    ).toBe(true);
  });

  it("falls back to any region when the answer's region is too small", () => {
    const question = buildQuestion("silhouette", hisui[0], pool, createRng(1));

    expect(question.choices).toHaveLength(CHOICE_COUNT);
    expect(question.choices.map((choice) => choice.key)).toContain("899");
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8])(
    "offers four different regions including the answer (seed %s)",
    (seed) => {
      const question = buildQuestion("region", johto[0], pool, createRng(seed));
      const keys = question.choices.map((choice) => choice.key);

      expect(question.answerKey).toBe("johto");
      expect(new Set(keys).size).toBe(CHOICE_COUNT);
      expect(keys).toContain("johto");
      expect(
        question.choices.find((choice) => choice.key === "johto")?.label,
      ).toBe("Johto");
    },
  );

  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])(
    "never pairs Sinnoh with Hisui (seed %s)",
    (seed) => {
      const sinnoh = pokemon(387, "sinnoh");
      const fromSinnoh = buildQuestion("region", sinnoh, pool, createRng(seed));
      const fromHisui = buildQuestion(
        "region",
        hisui[0],
        pool,
        createRng(seed),
      );

      expect(fromSinnoh.choices.map((choice) => choice.key)).not.toContain(
        "hisui",
      );
      expect(fromHisui.choices.map((choice) => choice.key)).not.toContain(
        "sinnoh",
      );
    },
  );
});

function spriteIds(question: { choices: QuizChoice[] }): number[] {
  return question.choices.flatMap((choice) =>
    choice.kind === "sprite" ? [choice.pokemonId] : [],
  );
}

describe("dex number questions", () => {
  const species = Array.from({ length: 120 }, (_, index) =>
    pokemon(index + 1, "kanto"),
  );

  it.each([1, 2, 3, 4, 5, 6, 7, 8])(
    "offers four nearby sprite choices (seed %s)",
    (seed) => {
      const question = buildQuestion(
        "dex",
        species[59],
        species,
        createRng(seed),
      );
      const ids = spriteIds(question);

      expect(question.answerKey).toBe("60");
      expect(new Set(ids).size).toBe(CHOICE_COUNT);
      expect(ids).toContain(60);
      expect(ids.every((id) => Math.abs(id - 60) <= NEARBY_DEX_RANGE)).toBe(
        true,
      );
    },
  );

  it("only gives sprite choices in dex mode", () => {
    const question = buildQuestion("dex", species[10], species, createRng(4));
    const nameQuestion = buildQuestion(
      "sprite",
      species[10],
      species,
      createRng(4),
    );

    expect(question.choices.every((choice) => choice.kind === "sprite")).toBe(
      true,
    );
    expect(nameQuestion.choices.every((choice) => choice.kind === "text")).toBe(
      true,
    );
  });

  it("still finds four choices at the start of the Pokédex", () => {
    const question = buildQuestion("dex", species[0], species, createRng(2));

    expect(question.choices).toHaveLength(CHOICE_COUNT);
    expect(spriteIds(question).every((id) => id <= 1 + NEARBY_DEX_RANGE)).toBe(
      true,
    );
  });

  it("names the number and the Pokémon in the reveal", () => {
    const state = startQuiz(species, createRng(1), "dex");
    const { answer } = state.current;

    expect(describeAnswer(state)).toBe(
      `#${String(answer.speciesId).padStart(4, "0")} is ${answer.displayName}!`,
    );
  });
});

describe("questionSpriteIds", () => {
  const question = buildQuestion("dex", johto[0], pool, createRng(1));

  it("waits for the prompt sprite in sprite modes", () => {
    const nameQuestion = buildQuestion("sprite", kanto[0], pool, createRng(1));

    expect(questionSpriteIds("sprite", nameQuestion)).toEqual([1]);
    expect(questionSpriteIds("silhouette", nameQuestion)).toEqual([1]);
  });

  it("waits for every choice sprite in dex mode", () => {
    expect(questionSpriteIds("dex", question)).toEqual(spriteIds(question));
  });
});

describe("describeAnswer", () => {
  it("names the Pokémon", () => {
    const state = startQuiz(kanto, createRng(1), "sprite");

    expect(describeAnswer(state)).toBe(
      `It's ${state.current.answer.displayName}!`,
    );
  });

  it("names the Pokémon and its region in region mode", () => {
    const state = startQuiz(johto, createRng(1), "region");

    expect(describeAnswer(state)).toBe(
      `It's ${state.current.answer.displayName}, from Johto!`,
    );
  });
});

describe("quiz state", () => {
  const started = startQuiz(pool, createRng(5), "sprite");
  const answerKey = started.current.answerKey;
  const wrongKey = started.current.choices.find(
    (choice) => choice.key !== answerKey,
  )!.key;

  it("starts with an empty score and two different questions", () => {
    expect(started).toMatchObject({
      mode: "sprite",
      pickedKey: null,
      correct: 0,
      wrong: 0,
      streak: 0,
      bestStreak: 0,
    });
    expect(started.upcoming.answerKey).not.toBe(answerKey);
  });

  it("counts a right answer and grows the streak", () => {
    expect(answerQuestion(started, answerKey)).toMatchObject({
      pickedKey: answerKey,
      correct: 1,
      wrong: 0,
      streak: 1,
      bestStreak: 1,
    });
  });

  it("counts a wrong answer and resets the streak but keeps the best", () => {
    const streaking = { ...started, streak: 4, bestStreak: 4 };

    expect(answerQuestion(streaking, wrongKey)).toMatchObject({
      pickedKey: wrongKey,
      wrong: 1,
      streak: 0,
      bestStreak: 4,
    });
  });

  it("ignores a second answer to the same question", () => {
    const answered = answerQuestion(started, wrongKey);

    expect(answerQuestion(answered, answerKey)).toBe(answered);
  });

  it("never shows the same Pokémon twice in a row across cycles", () => {
    let state = startQuiz(pool, createRng(21), "sprite");
    const rng = createRng(22);
    const answers = [state.current.answer.id];
    for (let step = 0; step < pool.length * 3; step++) {
      state = advanceQuestion(state, rng);
      answers.push(state.current.answer.id);
    }

    expect(
      answers.every((id, index) => index === 0 || id !== answers[index - 1]),
    ).toBe(true);
  });

  it("numbers each question", () => {
    const advanced = advanceQuestion(
      advanceQuestion(started, createRng(2)),
      createRng(3),
    );

    expect(started.questionNumber).toBe(1);
    expect(advanced.questionNumber).toBe(3);
  });

  it("moves the upcoming question up and clears the pick", () => {
    const answered = answerQuestion(started, answerKey);
    const advanced = advanceQuestion(answered, createRng(11));

    expect(advanced.current).toBe(started.upcoming);
    expect(advanced.pickedKey).toBeNull();
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
  const waiting = startRound(
    pool,
    createRng(8),
    { mode: "sprite", clock: 30 },
    1_000,
  );
  const shown = showQuestion(waiting, 2_000);
  const answerKey = shown.quiz.current.answerKey;

  it("waits for the first question to be shown", () => {
    expect(waiting.shown).toBe(false);
    expect(remainingMs(waiting.clock, 60_000)).toBe(30_000);
  });

  it("ignores answers while waiting for the question", () => {
    expect(answerRound(waiting, answerKey, 1_500)).toBe(waiting);
  });

  it("starts the clock when the question is shown", () => {
    expect(shown.shown).toBe(true);
    expect(remainingMs(shown.clock, 12_000)).toBe(20_000);
  });

  it("scores an answer and pauses the clock", () => {
    const answered = answerRound(shown, answerKey, 7_000);

    expect(answered.quiz.correct).toBe(1);
    expect(answered.clock.pausedAt).toBe(7_000);
    expect(answered.shown).toBe(true);
  });

  it("ignores an answer after time is up", () => {
    expect(answerRound(shown, answerKey, 32_000)).toBe(shown);
  });

  it("doesn't restart the clock while the answer is showing", () => {
    const answered = answerRound(shown, answerKey, 7_000);

    expect(showQuestion(answered, 7_100)).toBe(answered);
  });

  it("waits for the next question after moving on", () => {
    const answered = answerRound(shown, answerKey, 7_000);
    const next = nextQuestion(answered, createRng(3), 7_300);

    expect(next.quiz.current).toBe(answered.quiz.upcoming);
    expect(next.shown).toBe(false);
    expect(remainingMs(showQuestion(next, 9_000).clock, 9_000)).toBe(25_000);
  });

  const wrongKey = shown.quiz.current.choices.find(
    (choice) => choice.key !== answerKey,
  )!.key;

  it("takes time off for a wrong answer", () => {
    const answered = answerRound(shown, wrongKey, 7_000);

    expect(answered.clockDeltaMs).toBe(-WRONG_ANSWER_PENALTY_MS);
    expect(remainingMs(answered.clock, 7_000)).toBe(
      25_000 - WRONG_ANSWER_PENALTY_MS,
    );
  });

  it("doesn't take time off for a right answer", () => {
    const answered = answerRound(shown, answerKey, 7_000);

    expect(answered.clockDeltaMs).toBe(0);
    expect(remainingMs(answered.clock, 7_000)).toBe(25_000);
  });

  it("only takes the time that's left", () => {
    const answered = answerRound(shown, wrongKey, 30_800);

    expect(answered.clockDeltaMs).toBe(-1_200);
    expect(remainingMs(answered.clock, 30_800)).toBe(0);
  });

  it("uses up exactly the last 2 seconds", () => {
    const answered = answerRound(shown, wrongKey, 30_000);

    expect(answered.clockDeltaMs).toBe(-2_000);
    expect(remainingMs(answered.clock, 30_000)).toBe(0);
  });

  it("doesn't penalize a second click on the same question", () => {
    const answered = answerRound(shown, wrongKey, 7_000);

    expect(answerRound(answered, answerKey, 7_050)).toBe(answered);
  });

  it("clears the penalty for the next question", () => {
    const answered = answerRound(shown, wrongKey, 7_000);

    expect(nextQuestion(answered, createRng(3), 7_300).clockDeltaMs).toBe(0);
  });

  it("finishes the round only after the reveal", () => {
    const answered = answerRound(shown, wrongKey, 31_000);
    const next = nextQuestion(answered, createRng(3), 31_300);

    expect(isRoundOver(answered, 31_000)).toBe(false);
    expect(isRoundOver(next, 31_300)).toBe(true);
  });

  it("finishes the round when time runs out on an open question", () => {
    expect(isRoundOver(shown, 31_999)).toBe(false);
    expect(isRoundOver(shown, 32_000)).toBe(true);
  });

  it("pauses the clock and blocks answers while on hold", () => {
    const held = holdRound(shown, 5_000);

    expect(isClockRunning(held)).toBe(false);
    expect(remainingMs(held.clock, 50_000)).toBe(27_000);
    expect(answerRound(held, answerKey, 6_000)).toBe(held);
  });

  it("resumes the clock when released mid-question", () => {
    const released = releaseRound(holdRound(shown, 5_000), 9_000);

    expect(isClockRunning(released)).toBe(true);
    expect(remainingMs(released.clock, 9_000)).toBe(27_000);
  });

  it("keeps the clock paused when released during the reveal", () => {
    const answered = answerRound(shown, answerKey, 7_000);
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

describe("time attack round", () => {
  const shown = showQuestion(
    startRound(pool, createRng(8), { mode: "sprite", clock: "attack" }, 1_000),
    2_000,
  );
  const answerKey = shown.quiz.current.answerKey;
  const wrongKey = shown.quiz.current.choices.find(
    (choice) => choice.key !== answerKey,
  )!.key;

  it("starts with 30 seconds", () => {
    expect(remainingMs(shown.clock, 2_000)).toBe(30_000);
  });

  it("adds time for a right answer", () => {
    const answered = answerRound(shown, answerKey, 7_000);

    expect(answered.clockDeltaMs).toBe(TIME_ATTACK_BONUS_MS);
    expect(remainingMs(answered.clock, 7_000)).toBe(
      25_000 + TIME_ATTACK_BONUS_MS,
    );
  });

  it("takes time off for a wrong answer", () => {
    const answered = answerRound(shown, wrongKey, 7_000);

    expect(answered.clockDeltaMs).toBe(-WRONG_ANSWER_PENALTY_MS);
    expect(remainingMs(answered.clock, 7_000)).toBe(23_000);
  });

  it("stops adding time at the cap", () => {
    const nearCap = {
      ...shown,
      clock: { ...shown.clock, endsAt: 2_000 + TIME_ATTACK_MAX_MS - 1_000 },
    };
    const answered = answerRound(nearCap, answerKey, 2_000);

    expect(answered.clockDeltaMs).toBe(1_000);
    expect(remainingMs(answered.clock, 2_000)).toBe(TIME_ATTACK_MAX_MS);
  });

  it("adds nothing when already at the cap", () => {
    const atCap = {
      ...shown,
      clock: { ...shown.clock, endsAt: 2_000 + TIME_ATTACK_MAX_MS },
    };

    expect(answerRound(atCap, answerKey, 2_000).clockDeltaMs).toBe(0);
  });
});

describe("formatClockDelta", () => {
  it.each([
    [-2_000, "−2s"],
    [-1_200, "−1.2s"],
    [-450, "−0.5s"],
    [3_000, "+3s"],
    [1_000, "+1s"],
    [20, null],
    [-40, null],
    [0, null],
  ])("%s -> %s", (ms, expected) => {
    expect(formatClockDelta(ms)).toBe(expected);
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
