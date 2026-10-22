import type { PokemonSummary } from "../types/pokemon";
import { SPECIES } from "./pokedex";
import { sample, shuffle, type Rng } from "./random";

export const MATCH_LEVELS = ["easy", "medium", "hard"] as const;

export type MatchLevel = (typeof MATCH_LEVELS)[number];

export const DEFAULT_MATCH_LEVEL: MatchLevel = "easy";

export const MATCH_PAIRS: Record<MatchLevel, number> = {
  easy: 6,
  medium: 8,
  hard: 12,
};

export const MATCH_MISS_MS = 1_000;

export type MatchPhase = "loading" | "playing" | "done";

export type MatchGame = {
  level: MatchLevel;
  cards: PokemonSummary[];
  matched: boolean[];
  faceUp: number[];
  flips: number;
  phase: MatchPhase;
  elapsedMs: number;
  runningSince: number | null;
  onHold: boolean;
  startedAt: number;
};

export function parseMatchLevel(value: unknown): MatchLevel | null {
  return MATCH_LEVELS.find((level) => level === value) ?? null;
}

export function parseMatchLevelSearch(search: Record<string, unknown>): {
  level: MatchLevel;
} {
  return { level: parseMatchLevel(search.level) ?? DEFAULT_MATCH_LEVEL };
}

export function startMatch(
  level: MatchLevel,
  rng: Rng,
  now: number,
): MatchGame {
  const pokemon = sample(SPECIES, MATCH_PAIRS[level], rng);
  const cards = shuffle([...pokemon, ...pokemon], rng);

  return {
    level,
    cards,
    matched: cards.map(() => false),
    faceUp: [],
    flips: 0,
    phase: "loading",
    elapsedMs: 0,
    runningSince: null,
    onHold: false,
    startedAt: now,
  };
}

export function boardLoaded(game: MatchGame): MatchGame {
  return game.phase === "loading" ? { ...game, phase: "playing" } : game;
}

export function elapsedMs(game: MatchGame, now: number): number {
  return (
    game.elapsedMs +
    (game.runningSince === null ? 0 : Math.max(0, now - game.runningSince))
  );
}

export function stopClock(game: MatchGame, now: number): MatchGame {
  return game.runningSince === null
    ? game
    : { ...game, elapsedMs: elapsedMs(game, now), runningSince: null };
}

export function isMiss(game: MatchGame): boolean {
  return game.faceUp.length === 2;
}

export function isFaceUp(game: MatchGame, index: number): boolean {
  return game.matched[index] || game.faceUp.includes(index);
}

export function canFlip(game: MatchGame, index: number): boolean {
  return (
    game.phase === "playing" &&
    !game.onHold &&
    !game.matched[index] &&
    (isMiss(game) || !game.faceUp.includes(index))
  );
}

export function flipCard(
  game: MatchGame,
  index: number,
  now: number,
): MatchGame {
  if (!canFlip(game, index)) {
    return game;
  }

  const open = isMiss(game) ? [] : game.faceUp;
  const flipped: MatchGame = {
    ...game,
    faceUp: [...open, index],
    flips: game.flips + 1,
    runningSince: game.runningSince ?? now,
  };

  if (flipped.faceUp.length < 2) {
    return flipped;
  }

  const [first, second] = flipped.faceUp;

  if (game.cards[first].id !== game.cards[second].id) {
    return flipped;
  }

  const matched = flipped.matched.map(
    (isMatched, card) => isMatched || card === first || card === second,
  );
  const paired = { ...flipped, matched, faceUp: [] };

  return matched.every(Boolean)
    ? { ...stopClock(paired, now), phase: "done" }
    : paired;
}

export function hideMiss(game: MatchGame): MatchGame {
  return isMiss(game) ? { ...game, faceUp: [] } : game;
}

export function holdMatch(game: MatchGame, now: number): MatchGame {
  return game.onHold ? game : { ...stopClock(game, now), onHold: true };
}

export function resumeClock(game: MatchGame, now: number): MatchGame {
  const paused =
    game.runningSince === null &&
    game.flips > 0 &&
    game.phase === "playing" &&
    !game.onHold;

  return paused ? { ...game, runningSince: now } : game;
}

export function releaseMatch(game: MatchGame, now: number): MatchGame {
  return game.onHold ? resumeClock({ ...game, onHold: false }, now) : game;
}

export function pairsFound(game: MatchGame): number {
  return game.matched.filter(Boolean).length / 2;
}

const LEVEL_LABELS: Record<MatchLevel, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export function formatMatchLevel(level: MatchLevel): string {
  return `${LEVEL_LABELS[level]} · ${MATCH_PAIRS[level]} pairs`;
}

export function formatMatchTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
