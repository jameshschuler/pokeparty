import { describe, expect, it } from "vitest";
import { EVOLUTION_FAMILIES } from "./pokedex";
import { formatPokemonLabel } from "./pokemon";
import { createRng } from "./random";
import {
  boardLoaded,
  canFlip,
  describeMatchStatus,
  finishMatch,
  matchedCryCard,
  elapsedMs,
  flipCard,
  formatMatchLevel,
  formatMatchTime,
  hideMiss,
  holdMatch,
  isFaceUp,
  isMiss,
  MATCH_LEVEL_RULES,
  pairsFound,
  parseMatchLevel,
  releaseMatch,
  resumeClock,
  startMatch,
  stopClock,
  type MatchCard,
  type MatchGame,
} from "./match";

function playing(): MatchGame {
  return boardLoaded(startMatch("easy", createRng(3), 0));
}

function pairsOf(game: MatchGame): MatchCard[][] {
  return game.cards.reduce<MatchCard[][]>((pairs, card) => {
    pairs[card.pair] = [...(pairs[card.pair] ?? []), card];

    return pairs;
  }, []);
}

function pairOf(game: MatchGame, index: number): number {
  return game.cards.findIndex(
    (card, other) => other !== index && card.pair === game.cards[index].pair,
  );
}

function notPairOf(game: MatchGame, index: number): number {
  return game.cards.findIndex(
    (card, other) => other !== index && card.pair !== game.cards[index].pair,
  );
}

describe("parseMatchLevel", () => {
  it.each([
    ["easy", "easy"],
    ["hard", "hard"],
    ["Hard", null],
    [6, null],
    [undefined, null],
  ])("%j -> %j", (value, expected) => {
    expect(parseMatchLevel(value)).toBe(expected);
  });
});

describe("startMatch", () => {
  it.each(["easy", "medium", "hard", "silhouette", "evolution"] as const)(
    "deals a %s board where every card has exactly one partner",
    (level) => {
      const game = startMatch(level, createRng(5), 0);
      const counts = new Map<number, number>();
      for (const card of game.cards) {
        counts.set(card.pair, (counts.get(card.pair) ?? 0) + 1);
      }

      expect(game.cards).toHaveLength(MATCH_LEVEL_RULES[level].pairs * 2);
      expect(counts.size).toBe(MATCH_LEVEL_RULES[level].pairs);
      expect([...counts.values()].every((count) => count === 2)).toBe(true);
    },
  );

  it("pairs the same Pokémon on the plain levels", () => {
    const game = startMatch("medium", createRng(5), 0);

    expect(
      game.cards.every(
        (card) =>
          !card.silhouette &&
          game.cards.some(
            (other) => other !== card && other.pokemon === card.pokemon,
          ),
      ),
    ).toBe(true);
  });

  it("pairs a Pokémon with its silhouette", () => {
    const game = startMatch("silhouette", createRng(5), 0);
    const pairs = pairsOf(game);

    expect(
      pairs.every(
        (pair) =>
          pair[0].pokemon === pair[1].pokemon &&
          pair.filter((card) => card.silhouette).length === 1,
      ),
    ).toBe(true);
  });

  it("pairs a Pokémon with its evolution, one family each", () => {
    const game = startMatch("evolution", createRng(5), 0);
    const pairs = pairsOf(game);
    const families = pairs.map((pair) => {
      const ids = pair.map((card) => card.pokemon.id);

      return EVOLUTION_FAMILIES.findIndex((family) =>
        family.some(
          (link) => ids.includes(link.from.id) && ids.includes(link.to.id),
        ),
      );
    });

    expect(families.every((family) => family >= 0)).toBe(true);
    expect(new Set(families).size).toBe(pairs.length);
  });

  it("waits for the sprites before cards can be flipped", () => {
    const game = startMatch("easy", createRng(5), 0);

    expect(canFlip(game, 0)).toBe(false);
    expect(canFlip(boardLoaded(game), 0)).toBe(true);
  });
});

describe("flipCard", () => {
  it("turns a card face up and counts the flip", () => {
    const flipped = flipCard(playing(), 0, 1_000);

    expect(isFaceUp(flipped, 0)).toBe(true);
    expect(flipped.flips).toBe(1);
  });

  it("keeps a pair face up when the two cards match", () => {
    const game = playing();
    const matched = flipCard(flipCard(game, 0, 1_000), pairOf(game, 0), 2_000);

    expect(matched.matched[0]).toBe(true);
    expect(matched.faceUp).toEqual([]);
    expect(pairsFound(matched)).toBe(1);
  });

  it("shows a miss until it's hidden", () => {
    const game = playing();
    const miss = flipCard(flipCard(game, 0, 1_000), notPairOf(game, 0), 2_000);

    expect(isMiss(miss)).toBe(true);
    expect(isFaceUp(hideMiss(miss), 0)).toBe(false);
  });

  it("lets a missed card be tapped again right away", () => {
    const game = playing();
    const miss = flipCard(flipCard(game, 0, 1), notPairOf(game, 0), 2);

    expect(canFlip(miss, 0)).toBe(true);
    expect(flipCard(miss, 0, 3).faceUp).toEqual([0]);
  });

  it("flips a miss back early when a third card is tapped", () => {
    const game = playing();
    const other = notPairOf(game, 0);
    const third = game.cards.findIndex(
      (_, index) => index !== 0 && index !== other,
    );
    const next = flipCard(flipCard(flipCard(game, 0, 1), other, 2), third, 3);

    expect(next.faceUp).toEqual([third]);
    expect(next.flips).toBe(3);
  });

  it.each([
    [
      "a card that's already face up",
      (game: MatchGame) => flipCard(game, 0, 1),
    ],
    ["while on hold", (game: MatchGame) => holdMatch(game, 1)],
  ])("ignores a flip of %s", (_, prepare) => {
    const game = prepare(playing());

    expect(flipCard(game, 0, 2)).toBe(game);
  });

  it("ignores a flip of a matched card", () => {
    const game = playing();
    const matched = flipCard(flipCard(game, 0, 1), pairOf(game, 0), 2);

    expect(flipCard(matched, 0, 3)).toBe(matched);
  });

  it("finishes when every pair is found, with a perfect flip count", () => {
    let game = playing();
    let now = 1_000;
    for (let index = 0; index < game.cards.length; index++) {
      if (!game.matched[index]) {
        game = flipCard(game, index, now);
        game = flipCard(game, pairOf(game, index), now + 500);
        now += 1_000;
      }
    }

    expect(game.phase).toBe("done");
    expect(game.flips).toBe(MATCH_LEVEL_RULES.easy.pairs * 2);
    expect(elapsedMs(game, 999_999)).toBe(5_500);
  });
});

describe("describeMatchStatus", () => {
  it("guides the player and names each match", () => {
    const game = playing();
    const first = flipCard(game, 0, 1);
    const matched = flipCard(first, pairOf(game, 0), 2);

    expect(describeMatchStatus(startMatch("easy", createRng(3), 0)).text).toBe(
      "Getting the cards ready…",
    );
    expect(describeMatchStatus(game).text).toBe("Find the pairs");
    expect(describeMatchStatus(first).text).toBe("Now find its pair");
    expect(describeMatchStatus(matched).text).toBe(
      `Match! ${formatPokemonLabel(game.cards[0].pokemon)}`,
    );
  });

  it("says when two cards don't match", () => {
    const game = playing();
    const miss = flipCard(flipCard(game, 0, 1), notPairOf(game, 0), 2);

    expect(describeMatchStatus(miss).text).toBe("Not a match");
    expect(describeMatchStatus(miss).tone).toBe("bad");
  });

  it("names an evolution pair in evolution order, whichever is flipped first", () => {
    const game = boardLoaded(startMatch("evolution", createRng(3), 0));
    const evolved = game.cards.findIndex((card) => card.evolved);
    const matched = flipCard(
      flipCard(game, evolved, 1),
      pairOf(game, evolved),
      2,
    );
    const [from, to] = [game.cards[pairOf(game, evolved)], game.cards[evolved]];

    expect(describeMatchStatus(matched).text).toBe(
      `Match! ${formatPokemonLabel(from.pokemon)} → ${formatPokemonLabel(to.pokemon)}`,
    );
  });

  it("clears the match message on the next flip", () => {
    const game = playing();
    const matched = flipCard(flipCard(game, 0, 1), pairOf(game, 0), 2);
    const next = game.cards.findIndex((_, index) => !matched.matched[index]);

    expect(flipCard(matched, next, 3).lastMatch).toBeNull();
  });
});

describe("matchedCryCard", () => {
  it("picks the evolved Pokémon of an evolution pair, whichever is flipped last", () => {
    const game = boardLoaded(startMatch("evolution", createRng(3), 0));
    const evolved = game.cards.findIndex((card) => card.evolved);
    const matched = flipCard(
      flipCard(game, evolved, 1),
      pairOf(game, evolved),
      2,
    );

    expect(matchedCryCard(matched)).toBe(evolved);
    expect(matchedCryCard(game)).toBeNull();
  });
});

describe("finishMatch", () => {
  it("waits while the player holds Quit", () => {
    let game = playing();
    for (let index = 0; index < game.cards.length; index++) {
      if (!game.matched[index]) {
        game = flipCard(flipCard(game, index, 1), pairOf(game, index), 2);
      }
    }
    const held = holdMatch(game, 3);

    expect(finishMatch(held)).toBe(held);
  });

  it("finishes only a game whose pairs are all found", () => {
    let game = playing();

    expect(finishMatch(game).finished).toBe(false);

    for (let index = 0; index < game.cards.length; index++) {
      if (!game.matched[index]) {
        game = flipCard(flipCard(game, index, 1), pairOf(game, index), 2);
      }
    }

    expect(describeMatchStatus(game).text).toBe("All pairs found!");
    expect(finishMatch(game).finished).toBe(true);
  });
});

describe("clock", () => {
  it("starts on the first flip", () => {
    const game = playing();

    expect(elapsedMs(game, 50_000)).toBe(0);
    expect(elapsedMs(flipCard(game, 0, 10_000), 12_000)).toBe(2_000);
  });

  it("pauses while on hold", () => {
    const started = flipCard(playing(), 0, 10_000);
    const held = holdMatch(started, 12_000);
    const released = releaseMatch(held, 30_000);

    expect(elapsedMs(held, 25_000)).toBe(2_000);
    expect(elapsedMs(released, 31_000)).toBe(3_000);
  });

  it("pauses while the tab is in the background", () => {
    const started = flipCard(playing(), 0, 10_000);
    const hidden = stopClock(started, 12_000);
    const shown = resumeClock(hidden, 60_000);

    expect(elapsedMs(hidden, 50_000)).toBe(2_000);
    expect(elapsedMs(shown, 61_000)).toBe(3_000);
  });

  it("doesn't resume the clock while the quit dialog is open", () => {
    const held = holdMatch(flipCard(playing(), 0, 10_000), 12_000);

    expect(resumeClock(held, 20_000)).toBe(held);
  });

  it("never counts negative time from a stale clock reading", () => {
    expect(elapsedMs(flipCard(playing(), 0, 10_000), 9_000)).toBe(0);
  });

  it("stays stopped after a hold before the first flip", () => {
    const released = releaseMatch(holdMatch(playing(), 1_000), 2_000);

    expect(elapsedMs(released, 9_000)).toBe(0);
  });
});

describe("formatting", () => {
  it.each([
    [0, "0:00"],
    [9_999, "0:09"],
    [65_000, "1:05"],
    [600_000, "10:00"],
  ])("%s ms -> %s", (ms, text) => {
    expect(formatMatchTime(ms)).toBe(text);
  });

  it.each([
    ["medium", "Medium · 8 pairs"],
    ["silhouette", "Silhouette · 8 pairs"],
    ["evolution", "Evolution · 8 pairs"],
  ] as const)("names %s with its pairs", (level, label) => {
    expect(formatMatchLevel(level)).toBe(label);
  });
});
