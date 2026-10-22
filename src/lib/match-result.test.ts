import { describe, expect, it } from "vitest";
import { boardLoaded, flipCard, startMatch } from "./match";
import {
  MAX_MATCH_TIME_MS,
  matchResult,
  matchResultUrl,
  parseMatchResult,
  type MatchResult,
} from "./match-result";
import { createRng } from "./random";

const result: MatchResult = { level: "medium", flips: 22, timeMs: 41_250 };

describe("matchResult", () => {
  it("takes the level, flips and time from a finished game", () => {
    let game = boardLoaded(startMatch("easy", createRng(2), 0));
    for (let index = 0; index < game.cards.length; index++) {
      const pair = game.cards.findIndex(
        (card, other) => other !== index && card.id === game.cards[index].id,
      );

      if (!game.matched[index]) {
        game = flipCard(flipCard(game, index, 1_000), pair, 3_500);
      }
    }

    expect(matchResult(game)).toEqual({
      level: "easy",
      flips: 12,
      timeMs: 2_500,
    });
  });
});

describe("parseMatchResult", () => {
  it("reads a result, as numbers or strings", () => {
    expect(parseMatchResult({ ...result })).toEqual(result);
    expect(
      parseMatchResult({ level: "easy", flips: "12", timeMs: "900" }),
    ).toEqual({ level: "easy", flips: 12, timeMs: 900 });
  });

  it.each([
    ["an unknown level", { level: "expert" }],
    ["fewer flips than a perfect game", { flips: 14 }],
    ["an odd number of flips", { flips: 23 }],
    ["a missing time", { timeMs: undefined }],
    ["a time past a day", { timeMs: MAX_MATCH_TIME_MS + 1 }],
  ])("rejects %s", (_, change) => {
    expect(parseMatchResult({ ...result, ...change })).toBeNull();
  });
});

describe("matchResultUrl", () => {
  it("builds a link that parses back to the same result", () => {
    const url = new URL(matchResultUrl(result, "https://example.com"));

    expect(url.pathname).toBe("/match/result");
    expect(parseMatchResult(Object.fromEntries(url.searchParams))).toEqual(
      result,
    );
  });
});
