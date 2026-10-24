import { describe, expect, it } from "vitest";
import { createNameDrop } from "./name-drop";
import {
  nameDropResult,
  nameDropResultUrl,
  parseNameDropResult,
  type NameDropResult,
} from "./name-drop-result";

const result: NameDropResult = { score: 1240, cleared: 23 };

describe("nameDropResult", () => {
  it("takes the score and Pokémon named from the game", () => {
    const game = { ...createNameDrop(1, 0), score: 90, cleared: 2 };

    expect(nameDropResult(game)).toEqual({ score: 90, cleared: 2 });
  });
});

describe("parseNameDropResult", () => {
  it("reads a result, as numbers or strings", () => {
    expect(parseNameDropResult({ ...result })).toEqual(result);
    expect(parseNameDropResult({ score: "0", cleared: "0" })).toEqual({
      score: 0,
      cleared: 0,
    });
  });

  it.each([
    ["a score that isn't a multiple of 10", { score: 1245 }],
    ["points with nothing named", { score: 50, cleared: 0 }],
    ["fewer points than the shortest names give", { score: 30, cleared: 23 }],
    ["more points than the longest names at x4 give", { score: 99_990 }],
    ["a missing count", { cleared: undefined }],
  ])("rejects %s", (_, change) => {
    expect(parseNameDropResult({ ...result, ...change })).toBeNull();
  });
});

describe("nameDropResultUrl", () => {
  it("builds a link that parses back to the same result", () => {
    const url = new URL(nameDropResultUrl(result, "https://example.com"));

    expect(url.pathname).toBe("/name-drop/result");
    expect(parseNameDropResult(Object.fromEntries(url.searchParams))).toEqual(
      result,
    );
  });
});
