import { describe, expect, it } from "vitest";
import { SPECIES } from "./pokedex";
import { typedName } from "./pokemon";
import {
  advance,
  backspace,
  createNameDrop,
  fallMs,
  finishNameDrop,
  holdNameDrop,
  longestNameAt,
  multiplier,
  NAME_DROP_KEYPAD_ROWS,
  NAME_DROP_LANES,
  NAME_DROP_LIVES,
  nextEventInMs,
  playTime,
  progress,
  releaseNameDrop,
  resumeClock,
  spawnIntervalMs,
  startNameDrop,
  stopClock,
  typeText,
  type NameDropGame,
} from "./name-drop";

function started(seed = 7): NameDropGame {
  return startNameDrop(createNameDrop(seed, 0), 0);
}

function untilDrops(game: NameDropGame, count: number): [NameDropGame, number] {
  let current = game;
  let now = 0;
  while (current.drops.length < count) {
    now += nextEventInMs(current, now)!;
    current = advance(current, now);
  }

  return [current, now];
}

describe("difficulty", () => {
  it("speeds up over time, down to a floor", () => {
    expect(spawnIntervalMs(0)).toBe(2_200);
    expect(spawnIntervalMs(60_000)).toBe(1_300);
    expect(spawnIntervalMs(600_000)).toBe(700);
    expect(fallMs(0)).toBe(8_000);
    expect(fallMs(600_000)).toBe(3_500);
  });

  it("starts with short names and lets longer ones in later", () => {
    expect(longestNameAt(0)).toBe(6);
    expect(longestNameAt(30_000)).toBe(8);
    expect(longestNameAt(60_000)).toBeGreaterThan(8);
  });

  it.each([
    [0, 1],
    [4, 1],
    [5, 2],
    [14, 3],
    [50, 4],
  ])("a combo of %s clears gives x%s", (combo, expected) => {
    expect(multiplier(combo)).toBe(expected);
  });
});

describe("playing", () => {
  it("waits for the start tap, then drops the first Pokémon", () => {
    const ready = createNameDrop(7, 0);

    expect(advance(ready, 5_000)).toBe(ready);
    expect(nextEventInMs(ready, 0)).toBeNull();

    const [game] = untilDrops(started(), 1);

    expect(game.drops[0].spawnedAt).toBe(800);
    expect(game.drops[0].typed.length).toBeLessThanOrEqual(6);
  });

  it("deals the same Pokémon for the same seed", () => {
    const [a] = untilDrops(started(3), 4);
    const [b] = untilDrops(started(3), 4);

    expect(a.drops.map((drop) => drop.typed)).toEqual(
      b.drops.map((drop) => drop.typed),
    );
  });

  it("never has a name on screen that starts another falling name", () => {
    let game = started(11);
    let now = 0;
    for (let step = 0; step < 400 && game.phase === "playing"; step++) {
      now += nextEventInMs(game, now)!;
      game = advance(game, now);
      for (const drop of game.drops) {
        const others = game.drops.filter((other) => other !== drop);
        expect(others.some((other) => other.typed.startsWith(drop.typed))).toBe(
          false,
        );
      }
    }
  });

  it("always waits a whole number of milliseconds, so a timer never fires short", () => {
    let game = started(5);
    let now = 0;
    let steps = 0;
    while (game.phase === "playing") {
      const delay = nextEventInMs(game, now)!;
      expect(Number.isInteger(delay)).toBe(true);
      now += delay;
      const next = advance(game, now);
      expect(next).not.toBe(game);
      game = next;
      steps++;
    }

    expect(steps).toBeGreaterThan(3);
  });

  it("takes a life when a Pokémon lands, and ends after the last one", () => {
    let game = started();
    let now = 0;
    while (game.lives === NAME_DROP_LIVES) {
      now += nextEventInMs(game, now)!;
      game = advance(game, now);
    }

    expect(game.lives).toBe(NAME_DROP_LIVES - 1);

    while (game.phase === "playing") {
      now += nextEventInMs(game, now)!;
      game = advance(game, now);
    }

    expect(game.phase).toBe("over");
    expect(game.lives).toBe(0);
    expect(nextEventInMs(game, now)).toBeNull();
  });
});

describe("typing", () => {
  it("locks onto the falling Pokémon whose name matches so far", () => {
    const [game, now] = untilDrops(started(), 1);
    const [drop] = game.drops;
    const typed = typeText(game, drop.typed.slice(0, 2), now);

    expect(typed.typed).toBe(drop.typed.slice(0, 2));
    expect(typed.lockedId).toBe(drop.id);
  });

  it("clears a finished name and scores its letters", () => {
    const [game, now] = untilDrops(started(), 1);
    const [drop] = game.drops;
    const cleared = typeText(game, drop.pokemon.displayName, now);

    expect(cleared.drops).toEqual([]);
    expect(cleared.score).toBe(drop.typed.length * 10);
    expect(cleared.cleared).toBe(1);
    expect(cleared.combo).toBe(1);
    expect(cleared.lastClear?.name).toBe(drop.pokemon.displayName);
    expect(cleared.typed).toBe("");
  });

  it("ignores a letter that matches nothing and breaks the combo", () => {
    const [game, now] = untilDrops(started(), 1);
    const withCombo = { ...game, combo: 4 };
    const wrong = typeText(withCombo, "!q!q", now);

    expect(wrong.typed).toBe("");
    expect(wrong.combo).toBe(0);
    expect(wrong.wrongLetters).toBe(2);
  });

  it("locks onto the lowest of two matching Pokémon", () => {
    const [game, now] = untilDrops(started(), 2);
    const [older, newer] = game.drops;
    const same = {
      ...game,
      drops: [
        { ...older, typed: "abra" },
        { ...newer, typed: "absol" },
      ],
    };

    expect(typeText(same, "ab", now).lockedId).toBe(older.id);
  });

  it("undoes a letter with backspace", () => {
    const [game, now] = untilDrops(started(), 1);
    const [drop] = game.drops;
    const typed = typeText(game, drop.typed.slice(0, 2), now);
    const undone = backspace(backspace(typed, now), now);

    expect(backspace(typed, now).typed).toBe(drop.typed.slice(0, 1));
    expect(undone.typed).toBe("");
    expect(undone.lockedId).toBeNull();
  });

  it("ignores backspace while the game is on hold", () => {
    const [game, now] = untilDrops(started(), 1);
    const typed = typeText(game, game.drops[0].typed.slice(0, 2), now);
    const held = holdNameDrop(typed, now);

    expect(backspace(held, now).typed).toBe(held.typed);
  });

  it("keeps your letters when the locked Pokémon lands but another still matches", () => {
    const [game, now] = untilDrops(started(), 2);
    const [older, newer] = game.drops;
    const twins = {
      ...game,
      drops: [
        { ...older, typed: "pikachu" },
        { ...newer, typed: "pichu" },
      ],
    };
    const locked = typeText(twins, "pi", now);
    const landed = advance(locked, older.spawnedAt + older.fallMs);

    expect(locked.lockedId).toBe(older.id);
    expect(landed.typed).toBe("pi");
    expect(landed.lockedId).toBe(newer.id);
  });

  it("drops the lock when the locked Pokémon lands", () => {
    const [game, now] = untilDrops(started(), 1);
    const [drop] = game.drops;
    const locked = typeText(game, drop.typed.slice(0, 1), now);
    const landed = advance(locked, drop.spawnedAt + drop.fallMs);

    expect(landed.lockedId).toBeNull();
    expect(landed.typed).toBe("");
  });

  it("ignores typing before the start and while on hold", () => {
    const ready = createNameDrop(7, 0);
    const [game, now] = untilDrops(started(), 1);
    const held = holdNameDrop(game, now);

    expect(typeText(ready, "abc", 0)).toBe(ready);
    expect(typeText(held, "a", now + 10)).toBe(held);
  });
});

describe("play clock", () => {
  it("stops during a hold, so nothing falls", () => {
    const [game, now] = untilDrops(started(), 1);
    const held = holdNameDrop(game, now);
    const released = releaseNameDrop(held, now + 60_000);

    expect(playTime(held, now + 60_000)).toBe(playTime(game, now));
    expect(playTime(released, now + 60_100)).toBe(playTime(game, now) + 100);
    expect(progress(released.drops[0], playTime(released, now + 60_000))).toBe(
      progress(game.drops[0], playTime(game, now)),
    );
  });

  it("stops while the tab is hidden and resumes after", () => {
    const [game, now] = untilDrops(started(), 1);
    const hidden = stopClock(game, now);

    expect(playTime(resumeClock(hidden, now + 9_000), now + 9_000)).toBe(
      playTime(game, now),
    );
  });

  it("never counts negative time from a stale reading", () => {
    expect(playTime(started(), -500)).toBe(0);
  });
});

describe("keypad", () => {
  it("has a key for every letter in every name", () => {
    const keys = new Set(NAME_DROP_KEYPAD_ROWS.join(""));
    const missing = SPECIES.flatMap((pokemon) =>
      [...typedName(pokemon.displayName)].filter((key) => !keys.has(key)),
    );

    expect(missing).toEqual([]);
  });
});

describe("lanes", () => {
  it("drops each Pokémon in a column, away from ones that just arrived", () => {
    let game = started(9);
    let now = 0;
    for (let step = 0; step < 200 && game.phase === "playing"; step++) {
      now += nextEventInMs(game, now)!;
      const before = game;
      game = advance(game, now);
      const newest = game.drops.at(-1);

      if (newest && !before.drops.some((drop) => drop.id === newest.id)) {
        expect(newest.lane).toBeGreaterThanOrEqual(0);
        expect(newest.lane).toBeLessThan(NAME_DROP_LANES);
        const crowded = before.drops.filter(
          (drop) => progress(drop, newest.spawnedAt) < 0.5,
        );

        if (crowded.length < NAME_DROP_LANES) {
          expect(crowded.map((drop) => drop.lane)).not.toContain(newest.lane);
        }
      }
    }
  });

  it("marks each new arrival for announcing", () => {
    const [game] = untilDrops(started(), 2);
    const newest = game.drops.at(-1)!;

    expect(game.lastSpawn).toEqual({
      id: newest.id,
      name: newest.pokemon.displayName,
    });
  });
});

describe("finishNameDrop", () => {
  it("finishes only a game that's over, and not during a hold", () => {
    const over = { ...started(), phase: "over" as const, runningSince: null };

    expect(finishNameDrop(started()).finished).toBe(false);
    expect(finishNameDrop(over).finished).toBe(true);
    expect(finishNameDrop({ ...over, onHold: true }).finished).toBe(false);
  });
});
