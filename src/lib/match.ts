import type { PokemonSummary } from "../types/pokemon";
import { EVOLUTION_FAMILIES, SPECIES } from "./pokedex";
import { sample, shuffle, type Rng } from "./random";

export const MATCH_LEVELS = [
  "easy",
  "medium",
  "hard",
  "silhouette",
  "evolution",
] as const;

export type MatchLevel = (typeof MATCH_LEVELS)[number];

export const DEFAULT_MATCH_LEVEL: MatchLevel = "easy";

export type MatchPairing = "same" | "silhouette" | "evolution";

type MatchLevelRules = {
  label: string;
  pairs: number;
  pairing: MatchPairing;
  hint: string | null;
};

export const MATCH_LEVEL_RULES: Record<MatchLevel, MatchLevelRules> = {
  easy: { label: "Easy", pairs: 6, pairing: "same", hint: null },
  medium: { label: "Medium", pairs: 8, pairing: "same", hint: null },
  hard: { label: "Hard", pairs: 12, pairing: "same", hint: null },
  silhouette: {
    label: "Silhouette",
    pairs: 8,
    pairing: "silhouette",
    hint: "Match each Pokémon to its silhouette.",
  },
  evolution: {
    label: "Evolution",
    pairs: 8,
    pairing: "evolution",
    hint: "Match each Pokémon to what it evolves into.",
  },
};

export type MatchCard = {
  pokemon: PokemonSummary;
  pair: number;
  silhouette: boolean;
};

export const MATCH_MISS_MS = 1_000;

export type MatchPhase = "loading" | "playing" | "done";

export type MatchGame = {
  level: MatchLevel;
  cards: MatchCard[];
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

function evolutionPairs(count: number, rng: Rng): PokemonSummary[][] {
  return sample(EVOLUTION_FAMILIES, count, rng).map((links) => {
    const [link] = sample(links, 1, rng);

    return [link.from, link.to];
  });
}

function dealPairs(
  pairing: MatchPairing,
  count: number,
  rng: Rng,
): MatchCard[][] {
  if (pairing === "evolution") {
    return evolutionPairs(count, rng).map(([from, to], pair) => [
      { pokemon: from, pair, silhouette: false },
      { pokemon: to, pair, silhouette: false },
    ]);
  }

  return sample(SPECIES, count, rng).map((pokemon, pair) => [
    { pokemon, pair, silhouette: false },
    { pokemon, pair, silhouette: pairing === "silhouette" },
  ]);
}

export function startMatch(
  level: MatchLevel,
  rng: Rng,
  now: number,
): MatchGame {
  const { pairs, pairing } = MATCH_LEVEL_RULES[level];
  const cards = shuffle(dealPairs(pairing, pairs, rng).flat(), rng);

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

  if (game.cards[first].pair !== game.cards[second].pair) {
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

export function formatMatchLevel(level: MatchLevel): string {
  const { label, pairs } = MATCH_LEVEL_RULES[level];

  return `${label} · ${pairs} pairs`;
}

export function formatMatchTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
