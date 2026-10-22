import { describe, expect, it } from "vitest";
import { startRound } from "./quiz";
import { createRng } from "./random";
import {
  MAX_RESULT_COUNT,
  parseQuizResult,
  quizResultUrl,
  roundResult,
  type QuizResult,
} from "./quiz-result";
import { quizPool } from "./pokedex";

const result: QuizResult = {
  mode: "silhouette",
  clock: "attack",
  score: 23,
  wrong: 4,
  streak: 11,
};

describe("roundResult", () => {
  it("takes the score, mistakes and best streak from the round", () => {
    const round = startRound(
      quizPool("dex"),
      createRng(1),
      { mode: "dex", clock: 90 },
      0,
    );
    const played = {
      ...round,
      quiz: { ...round.quiz, correct: 7, wrong: 2, streak: 1, bestStreak: 5 },
    };

    expect(roundResult(played)).toEqual({
      mode: "dex",
      clock: 90,
      score: 7,
      wrong: 2,
      streak: 5,
    });
  });
});

describe("parseQuizResult", () => {
  it("reads numbers the router has already parsed", () => {
    expect(parseQuizResult({ ...result })).toEqual(result);
  });

  it("reads numbers left as strings", () => {
    expect(
      parseQuizResult({
        mode: "sprite",
        clock: "60",
        score: "12",
        wrong: "0",
        streak: "12",
      }),
    ).toEqual({ mode: "sprite", clock: 60, score: 12, wrong: 0, streak: 12 });
  });

  it.each([
    ["an unknown mode", { mode: "shadow" }],
    ["an unknown clock", { clock: 45 }],
    ["a missing score", { score: undefined }],
    ["an empty score", { score: "" }],
    ["a negative count", { wrong: -1 }],
    ["a fraction", { score: 2.5 }],
    ["a count past the limit", { score: MAX_RESULT_COUNT + 1 }],
    ["a streak longer than the score", { streak: 24 }],
    ["a non-number", { wrong: "lots" }],
  ])("rejects %s", (_, change) => {
    expect(parseQuizResult({ ...result, ...change })).toBeNull();
  });

  it("accepts the largest count", () => {
    expect(
      parseQuizResult({
        ...result,
        score: MAX_RESULT_COUNT,
        streak: MAX_RESULT_COUNT,
      }),
    ).not.toBeNull();
  });
});

describe("quizResultUrl", () => {
  it("builds a link that parses back to the same result", () => {
    const url = new URL(quizResultUrl(result, "https://example.com"));

    expect(url.pathname).toBe("/quiz/result");
    expect(parseQuizResult(Object.fromEntries(url.searchParams))).toEqual(
      result,
    );
  });
});
