import type { PokemonSummary } from "../types/pokemon";
import { SPECIES } from "./pokedex";
import { typedName } from "./pokemon";
import { stepRng } from "./random";

export const NAME_DROP_LIVES = 3;

export const NAME_DROP_POINTS_PER_LETTER = 10;

export const NAME_DROP_MAX_MULTIPLIER = 4;

export const NAME_DROP_CLEARS_PER_MULTIPLIER = 5;

export const NAME_DROP_FINISH_MS = 1_000;

const FIRST_SPAWN_MS = 800;

export const NAME_DROP_LANES = 3;

const CROWDED_PROGRESS = 0.5;

const SLOWEST_SPAWN_MS = 2_200;

const FASTEST_SPAWN_MS = 700;

const SPAWN_SPEEDUP_PER_SECOND = 15;

const SLOWEST_FALL_MS = 8_000;

const FASTEST_FALL_MS = 3_500;

const FALL_SPEEDUP_PER_SECOND = 40;

type Candidate = {
  pokemon: PokemonSummary;
  typed: string;
};

const POOL: Candidate[] = SPECIES.map((pokemon) => ({
  pokemon,
  typed: typedName(pokemon.displayName),
}));

export const LONGEST_TYPED_NAME = Math.max(
  ...POOL.map((candidate) => candidate.typed.length),
);

export const SHORTEST_TYPED_NAME = Math.min(
  ...POOL.map((candidate) => candidate.typed.length),
);

export type Drop = Candidate & {
  id: number;
  lane: number;
  spawnedAt: number;
  fallMs: number;
};

export type NameDropPhase = "ready" | "playing" | "over";

export type NameDropGame = {
  phase: NameDropPhase;
  drops: Drop[];
  typed: string;
  lockedId: number | null;
  score: number;
  cleared: number;
  combo: number;
  bestCombo: number;
  lives: number;
  wrongLetters: number;
  lastSpawn: { id: number; name: string } | null;
  lastClear: { id: number; name: string; points: number } | null;
  rngState: number;
  nextId: number;
  nextSpawnAt: number;
  elapsedMs: number;
  runningSince: number | null;
  onHold: boolean;
  finished: boolean;
  startedAt: number;
};

export function createNameDrop(seed: number, now: number): NameDropGame {
  return {
    phase: "ready",
    drops: [],
    typed: "",
    lockedId: null,
    score: 0,
    cleared: 0,
    combo: 0,
    bestCombo: 0,
    lives: NAME_DROP_LIVES,
    wrongLetters: 0,
    lastSpawn: null,
    lastClear: null,
    rngState: seed >>> 0,
    nextId: 1,
    nextSpawnAt: FIRST_SPAWN_MS,
    elapsedMs: 0,
    runningSince: null,
    onHold: false,
    finished: false,
    startedAt: now,
  };
}

export function playTime(game: NameDropGame, now: number): number {
  return (
    game.elapsedMs +
    (game.runningSince === null ? 0 : Math.max(0, now - game.runningSince))
  );
}

export function spawnIntervalMs(at: number): number {
  return Math.max(
    FASTEST_SPAWN_MS,
    SLOWEST_SPAWN_MS - (SPAWN_SPEEDUP_PER_SECOND * at) / 1000,
  );
}

export function fallMs(at: number): number {
  return Math.max(
    FASTEST_FALL_MS,
    SLOWEST_FALL_MS - (FALL_SPEEDUP_PER_SECOND * at) / 1000,
  );
}

export function longestNameAt(at: number): number {
  if (at < 20_000) {
    return 6;
  }

  return at < 45_000 ? 8 : LONGEST_TYPED_NAME;
}

export function progress(drop: Drop, at: number): number {
  return Math.min(1, Math.max(0, (at - drop.spawnedAt) / drop.fallMs));
}

export function multiplier(combo: number): number {
  return Math.min(
    NAME_DROP_MAX_MULTIPLIER,
    1 + Math.floor(combo / NAME_DROP_CLEARS_PER_MULTIPLIER),
  );
}

function conflicts(typed: string, drops: Drop[]): boolean {
  return drops.some(
    (drop) => drop.typed.startsWith(typed) || typed.startsWith(drop.typed),
  );
}

function spawn(game: NameDropGame): NameDropGame {
  const at = game.nextSpawnAt;
  const longest = longestNameAt(at);
  const candidates = POOL.filter(
    (candidate) =>
      candidate.typed.length <= longest &&
      !conflicts(candidate.typed, game.drops),
  );
  const pick = stepRng(game.rngState);
  const lane = stepRng(pick.state);
  const crowded = new Set(
    game.drops
      .filter((drop) => progress(drop, at) < CROWDED_PROGRESS)
      .map((drop) => drop.lane),
  );
  const lanes = Array.from({ length: NAME_DROP_LANES }, (_, index) => index);
  const freeLanes = lanes.filter((index) => !crowded.has(index));
  const laneChoices = freeLanes.length > 0 ? freeLanes : lanes;
  const next = {
    ...game,
    rngState: lane.state,
    nextSpawnAt: at + spawnIntervalMs(at),
  };

  if (candidates.length === 0) {
    return next;
  }

  const candidate = candidates[Math.floor(pick.value * candidates.length)];

  return {
    ...next,
    nextId: game.nextId + 1,
    drops: [
      ...game.drops,
      {
        ...candidate,
        id: game.nextId,
        lane: laneChoices[Math.floor(lane.value * laneChoices.length)],
        spawnedAt: at,
        fallMs: fallMs(at),
      },
    ],
    lastSpawn: { id: game.nextId, name: candidate.pokemon.displayName },
  };
}

function land(game: NameDropGame, drop: Drop, now: number): NameDropGame {
  const lives = game.lives - 1;
  const remaining = {
    ...game,
    drops: game.drops.filter((other) => other.id !== drop.id),
    lives,
    combo: 0,
  };
  const relock =
    game.lockedId === drop.id
      ? lowestMatch(remaining, game.typed, drop.spawnedAt + drop.fallMs)
      : undefined;
  const landed =
    relock === undefined
      ? remaining
      : {
          ...remaining,
          typed: relock ? game.typed : "",
          lockedId: relock?.id ?? null,
        };

  return lives === 0 ? { ...stopClock(landed, now), phase: "over" } : landed;
}

function nextLanding(game: NameDropGame): Drop | null {
  return game.drops.reduce<Drop | null>(
    (first, drop) =>
      first === null ||
      drop.spawnedAt + drop.fallMs < first.spawnedAt + first.fallMs
        ? drop
        : first,
    null,
  );
}

function isRunning(game: NameDropGame): boolean {
  return game.phase === "playing" && game.runningSince !== null;
}

export function advance(game: NameDropGame, now: number): NameDropGame {
  if (!isRunning(game)) {
    return game;
  }

  const at = playTime(game, now);
  let current = game;

  while (current.phase === "playing") {
    const landing = nextLanding(current);
    const landsAt = landing ? landing.spawnedAt + landing.fallMs : Infinity;
    const eventAt = Math.min(landsAt, current.nextSpawnAt);

    if (eventAt > at) {
      break;
    }

    current =
      landing && landsAt <= current.nextSpawnAt
        ? land(current, landing, now)
        : spawn(current);
  }

  return current;
}

export function nextEventInMs(game: NameDropGame, now: number): number | null {
  if (!isRunning(game)) {
    return null;
  }

  const landing = nextLanding(game);
  const landsAt = landing ? landing.spawnedAt + landing.fallMs : Infinity;

  return Math.max(
    0,
    Math.ceil(Math.min(landsAt, game.nextSpawnAt) - playTime(game, now)),
  );
}

function lowestMatch(
  game: NameDropGame,
  typed: string,
  at: number,
): Drop | null {
  return game.drops
    .filter((drop) => drop.typed.startsWith(typed))
    .reduce<Drop | null>(
      (lowest, drop) =>
        lowest === null || progress(drop, at) > progress(lowest, at)
          ? drop
          : lowest,
      null,
    );
}

function typeLetter(
  game: NameDropGame,
  letter: string,
  at: number,
): NameDropGame {
  const typed = game.typed + letter;
  const match = lowestMatch(game, typed, at);

  if (!match) {
    return { ...game, combo: 0, wrongLetters: game.wrongLetters + 1 };
  }

  if (match.typed !== typed) {
    return { ...game, typed, lockedId: match.id };
  }

  const combo = game.combo + 1;
  const points =
    typed.length * NAME_DROP_POINTS_PER_LETTER * multiplier(game.combo);

  return {
    ...game,
    drops: game.drops.filter((drop) => drop.id !== match.id),
    typed: "",
    lockedId: null,
    score: game.score + points,
    lastClear: {
      id: match.id,
      name: match.pokemon.displayName,
      points,
    },
    cleared: game.cleared + 1,
    combo,
    bestCombo: Math.max(game.bestCombo, combo),
  };
}

export function typeText(
  game: NameDropGame,
  text: string,
  now: number,
): NameDropGame {
  const current = advance(game, now);

  if (!isRunning(current) || current.onHold) {
    return current;
  }

  const at = playTime(current, now);

  return [...typedName(text)].reduce(
    (state, letter) => typeLetter(state, letter, at),
    current,
  );
}

export function backspace(game: NameDropGame, now: number): NameDropGame {
  if (!isRunning(game) || game.typed === "") {
    return game;
  }

  const typed = game.typed.slice(0, -1);
  const match =
    typed === "" ? null : lowestMatch(game, typed, playTime(game, now));

  return { ...game, typed, lockedId: match?.id ?? null };
}

export function startNameDrop(game: NameDropGame, now: number): NameDropGame {
  return game.phase === "ready"
    ? { ...game, phase: "playing", runningSince: now }
    : game;
}

export function stopClock(game: NameDropGame, now: number): NameDropGame {
  return game.runningSince === null
    ? game
    : { ...game, elapsedMs: playTime(game, now), runningSince: null };
}

export function resumeClock(game: NameDropGame, now: number): NameDropGame {
  const paused =
    game.phase === "playing" && game.runningSince === null && !game.onHold;

  return paused ? { ...game, runningSince: now } : game;
}

export function holdNameDrop(game: NameDropGame, now: number): NameDropGame {
  return game.onHold
    ? game
    : { ...stopClock(advance(game, now), now), onHold: true };
}

export function releaseNameDrop(game: NameDropGame, now: number): NameDropGame {
  return game.onHold ? resumeClock({ ...game, onHold: false }, now) : game;
}

export function finishNameDrop(game: NameDropGame): NameDropGame {
  return game.phase === "over" && !game.onHold
    ? { ...game, finished: true }
    : game;
}

export type TypingChange = {
  erased: number;
  added: string;
};

export function diffTyping(previous: string, next: string): TypingChange {
  let same = 0;
  while (
    same < previous.length &&
    same < next.length &&
    previous[same] === next[same]
  ) {
    same++;
  }

  return {
    erased: typedName(previous.slice(same)).length,
    added: next.slice(same),
  };
}
