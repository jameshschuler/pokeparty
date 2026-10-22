import { describe, expect, it } from "vitest";
import { createRng } from "./random";
import {
  acceptsTap,
  advancePlayback,
  boardLoaded,
  completedLength,
  describeSimonStatus,
  expectedIndex,
  finishSimon,
  flashMs,
  formatSimonLevel,
  holdSimon,
  litIndex,
  parseSimonLevel,
  playbackDelayMs,
  randomIndex,
  releaseSimon,
  SIMON_BOARD_SIZES,
  SIMON_GAP_MS,
  SIMON_ROUND_PAUSE_MS,
  startSimon,
  tapSimon,
  timeOutSimon,
  type SimonGame,
} from "./simon";

function watching(sequence: number[]): SimonGame {
  return {
    ...boardLoaded(startSimon("easy", createRng(1), 0)),
    sequence,
  };
}

function repeating(sequence: number[], step = 0): SimonGame {
  return { ...watching(sequence), phase: "repeat", step };
}

function playThrough(game: SimonGame): SimonGame {
  let current = game;
  while (current.phase === "watch") {
    current = advancePlayback(current);
  }

  return current;
}

describe("parseSimonLevel", () => {
  it.each([
    ["easy", "easy"],
    ["medium", "medium"],
    ["hard", "hard"],
    ["Easy", null],
    [4, null],
    [undefined, null],
  ])("%j -> %j", (value, expected) => {
    expect(parseSimonLevel(value)).toBe(expected);
  });
});

describe("startSimon", () => {
  it.each(["easy", "medium", "hard"] as const)(
    "deals a %s board of different Pokémon",
    (level) => {
      const game = startSimon(level, createRng(2), 0);
      const ids = game.board.map((pokemon) => pokemon.id);

      expect(ids).toHaveLength(SIMON_BOARD_SIZES[level]);
      expect(new Set(ids).size).toBe(ids.length);
    },
  );

  it("starts with one step, waiting for the sprites", () => {
    const game = startSimon("easy", createRng(2), 0);

    expect(game.sequence).toHaveLength(1);
    expect(game.sequence[0]).toBeLessThan(4);
    expect(game.phase).toBe("loading");
    expect(completedLength(game)).toBe(0);
    expect(boardLoaded(game).phase).toBe("watch");
  });
});

describe("playback", () => {
  it("lights each step in turn, then hands over to the player", () => {
    const game = watching([2, 0, 2]);
    const lit: (number | null)[] = [];
    let current = game;
    while (current.phase === "watch") {
      current = advancePlayback(current);
      lit.push(litIndex(current));
    }

    expect(lit).toEqual([2, null, 0, null, 2, null]);
    expect(current.phase).toBe("repeat");
    expect(current.step).toBe(0);
  });

  it("pauses before a round, then shows each flash and gap", () => {
    const game = watching([1, 3]);

    expect(playbackDelayMs(game)).toBe(SIMON_ROUND_PAUSE_MS);
    expect(playbackDelayMs(advancePlayback(game))).toBe(flashMs(game));
    expect(playbackDelayMs(advancePlayback(advancePlayback(game)))).toBe(
      SIMON_GAP_MS,
    );
  });

  it("speeds up as the sequence grows, down to a floor", () => {
    expect(flashMs(watching([0]))).toBe(600);
    expect(flashMs(watching([0, 1, 2, 3, 0]))).toBe(500);
    expect(flashMs(watching(Array(40).fill(0)))).toBe(300);
  });

  it("doesn't play while on hold", () => {
    const held = holdSimon(watching([1]));

    expect(advancePlayback(held)).toBe(held);
  });

  it("replays from the start after a hold", () => {
    const midway = advancePlayback(advancePlayback(watching([1, 2])));
    const released = releaseSimon(holdSimon(midway));

    expect(released.step).toBe(0);
    expect(released.lit).toBe(false);
  });
});

describe("tapSimon", () => {
  it("moves along the sequence on a right tap", () => {
    const game = repeating([1, 3]);

    expect(tapSimon(game, 1, 0).step).toBe(1);
  });

  it("adds a step and plays it back after a full sequence", () => {
    const done = tapSimon(repeating([1, 3], 1), 3, 2);

    expect(done.phase).toBe("watch");
    expect(done.sequence).toEqual([1, 3, 2]);
    expect(done.step).toBe(0);
    expect(completedLength(done)).toBe(2);
  });

  it("ends the game on a wrong tap and shows the right one", () => {
    const over = tapSimon(repeating([1, 3], 1), 0, 2);

    expect(over.phase).toBe("over");
    expect(over.missedIndex).toBe(0);
    expect(expectedIndex(over)).toBe(3);
    expect(completedLength(over)).toBe(1);
  });

  it.each([
    ["while watching", watching([1])],
    ["while loading", startSimon("easy", createRng(1), 0)],
    ["while on hold", holdSimon(repeating([1]))],
  ])("ignores taps %s", (_, game) => {
    expect(tapSimon(game, 1, 0)).toBe(game);
  });

  it("never gives away the next step before the game is over", () => {
    expect(expectedIndex(repeating([1, 3]))).toBeNull();
  });
});

describe("acceptsTap", () => {
  it.each([
    ["while repeating", repeating([1]), true],
    ["while watching", watching([1]), false],
    ["while on hold", holdSimon(repeating([1])), false],
    ["once over", timeOutSimon(repeating([1])), false],
  ])("%s -> %s", (_, game, expected) => {
    expect(acceptsTap(game)).toBe(expected);
  });
});

describe("timeOutSimon", () => {
  it("ends the game when the player stops tapping", () => {
    const over = timeOutSimon(repeating([1, 3], 1));

    expect(over.phase).toBe("over");
    expect(over.missedIndex).toBeNull();
    expect(expectedIndex(over)).toBe(3);
  });

  it.each([
    ["while watching", watching([1])],
    ["while on hold", holdSimon(repeating([1]))],
  ])("does nothing %s", (_, game) => {
    expect(timeOutSimon(game)).toBe(game);
  });
});

describe("finishSimon", () => {
  it("finishes only a game that's over", () => {
    const over = timeOutSimon(repeating([1]));

    expect(finishSimon(over).finished).toBe(true);
    expect(finishSimon(repeating([1])).finished).toBe(false);
  });

  it("waits while the player decides whether to quit", () => {
    const held = holdSimon(timeOutSimon(repeating([1])));

    expect(finishSimon(held)).toBe(held);
    expect(finishSimon(releaseSimon(held)).finished).toBe(true);
  });
});

describe("randomIndex", () => {
  it("picks a spot on the board", () => {
    const rng = createRng(4);
    const picks = Array.from({ length: 200 }, () => randomIndex(6, rng));

    expect(new Set(picks)).toEqual(new Set([0, 1, 2, 3, 4, 5]));
  });
});

describe("describeSimonStatus", () => {
  it.each([
    [
      "loading",
      startSimon("easy", createRng(1), 0),
      "Getting the Pokémon ready…",
    ],
    ["watching", watching([1, 2]), "Watch closely…"],
    ["repeating", repeating([1, 2, 3], 1), "Your turn: 2 of 3"],
    ["missed", tapSimon(repeating([1]), 0, 0), "Not that one!"],
    ["too slow", timeOutSimon(repeating([1])), "Too slow!"],
  ])("%s -> %s", (_, game, text) => {
    expect(describeSimonStatus(game)).toBe(text);
  });
});

describe("a full game", () => {
  it("scores the longest sequence repeated", () => {
    let game = playThrough(watching([2]));
    for (let round = 0; round < 3; round++) {
      for (const index of game.sequence) {
        game = tapSimon(game, index, round);
      }
      game = playThrough(game);
    }

    expect(completedLength(game)).toBe(3);
    expect(game.sequence).toHaveLength(4);
  });
});

describe("formatSimonLevel", () => {
  it.each([
    ["easy", "Easy · 4 Pokémon"],
    ["medium", "Medium · 6 Pokémon"],
    ["hard", "Hard · 9 Pokémon"],
  ] as const)("%s -> %s", (level, label) => {
    expect(formatSimonLevel(level)).toBe(label);
  });
});
