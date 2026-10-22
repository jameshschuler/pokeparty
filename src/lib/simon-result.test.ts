import { describe, expect, it } from "vitest";
import { createRng } from "./random";
import { boardLoaded, startSimon } from "./simon";
import {
  parseSimonResult,
  simonResult,
  simonResultUrl,
  type SimonResult,
} from "./simon-result";

const result: SimonResult = { level: "medium", score: 12 };

describe("simonResult", () => {
  it("scores the sequences the player completed", () => {
    const game = {
      ...boardLoaded(startSimon("hard", createRng(1), 0)),
      sequence: [0, 1, 2, 3, 4],
    };

    expect(simonResult(game)).toEqual({ level: "hard", score: 4 });
  });
});

describe("parseSimonResult", () => {
  it("reads a result from the URL, as numbers or strings", () => {
    expect(parseSimonResult({ ...result })).toEqual(result);
    expect(parseSimonResult({ level: "easy", score: "3" })).toEqual({
      level: "easy",
      score: 3,
    });
  });

  it.each([
    ["an unknown level", { level: "expert" }],
    ["a missing score", { score: undefined }],
    ["a negative score", { score: -1 }],
    ["a fraction", { score: 1.5 }],
  ])("rejects %s", (_, change) => {
    expect(parseSimonResult({ ...result, ...change })).toBeNull();
  });
});

describe("simonResultUrl", () => {
  it("builds a link that parses back to the same result", () => {
    const url = new URL(simonResultUrl(result, "https://example.com"));

    expect(url.pathname).toBe("/simon/result");
    expect(parseSimonResult(Object.fromEntries(url.searchParams))).toEqual(
      result,
    );
  });
});
