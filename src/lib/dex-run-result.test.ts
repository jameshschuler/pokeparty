import { describe, expect, it } from "vitest";
import { answerDexRun, showDexQuestion, startDexRun } from "./dex-run";
import {
  clearedResult,
  dexRunResult,
  dexRunResultUrl,
  parseDexRunResult,
  type DexRunResult,
} from "./dex-run-result";
import { createRng } from "./random";

const result: DexRunResult = { range: 1, score: 42, wrong: 3, reached: 43 };

const cleared: DexRunResult = { range: 1, score: 150, wrong: 1, reached: 151 };

describe("dexRunResult", () => {
  it("takes right answers, lives lost and the number reached from the run", () => {
    const shown = showDexQuestion(startDexRun(2, createRng(3), 0), 500);
    const wrongKey = shown.question.choices.find(
      (choice) => choice.key !== shown.question.answerKey,
    )!.key;

    expect(dexRunResult(answerDexRun(shown, wrongKey, 1_000))).toEqual({
      range: 2,
      score: 0,
      wrong: 1,
      reached: 152,
    });
  });
});

describe("parseDexRunResult", () => {
  it("reads numbers the router has already parsed", () => {
    expect(parseDexRunResult({ ...result })).toEqual(result);
  });

  it("reads numbers left as strings", () => {
    expect(
      parseDexRunResult({
        range: "national",
        score: "9",
        wrong: "3",
        reached: "10",
      }),
    ).toEqual({ range: "national", score: 9, wrong: 3, reached: 10 });
  });

  it.each([
    ["an unknown dex", { range: 10 }],
    ["a missing score", { score: undefined }],
    ["more lives lost than there are", { wrong: 4 }],
    ["a number before the dex starts", { range: 2, reached: 100 }],
    ["a number past the dex", { reached: 152 }],
    ["more right answers than numbers reached", { score: 43, reached: 42 }],
    ["a run that stopped early with lives left", { wrong: 2 }],
  ])("rejects %s", (_, change) => {
    expect(parseDexRunResult({ ...result, ...change })).toBeNull();
  });
});

describe("clearedResult", () => {
  it("is cleared when a run reached the end with a life left", () => {
    expect(parseDexRunResult({ ...cleared })).toEqual(cleared);
    expect(clearedResult(cleared)).toBe(true);
    expect(clearedResult(result)).toBe(false);
  });
});

describe("dexRunResultUrl", () => {
  it("builds a link that parses back to the same result", () => {
    const url = new URL(dexRunResultUrl(result, "https://example.com"));

    expect(url.pathname).toBe("/dex-run/result");
    expect(parseDexRunResult(Object.fromEntries(url.searchParams))).toEqual(
      result,
    );
  });
});
