import type { PokemonSummary } from "../types/pokemon";
import { SPECIES } from "./pokedex";
import { sample, type Rng } from "./random";

export const SIMON_LEVELS = ["easy", "medium", "hard"] as const;

export type SimonLevel = (typeof SIMON_LEVELS)[number];

export const DEFAULT_SIMON_LEVEL: SimonLevel = "easy";

export const SIMON_BOARD_SIZES: Record<SimonLevel, number> = {
  easy: 4,
  medium: 6,
  hard: 9,
};

export const SIMON_IDLE_MS = 5_000;

export const SIMON_READY_MS = 1_500;

export const SIMON_LEAD_IN_MS = 400;

export const SIMON_HANDOVER_MS = 500;

export const SIMON_GAP_MS = 150;

export const SIMON_REVEAL_MS = 1_200;

export const SIMON_TAP_FLASH_MS = 180;

const SLOWEST_FLASH_MS = 600;

const FASTEST_FLASH_MS = 300;

const FLASH_SPEEDUP_MS = 25;

export type SimonPhase = "loading" | "ready" | "watch" | "repeat" | "over";

export type SimonGame = {
  level: SimonLevel;
  board: PokemonSummary[];
  sequence: number[];
  phase: SimonPhase;
  step: number;
  lit: boolean;
  missedIndex: number | null;
  onHold: boolean;
  finished: boolean;
  startedAt: number;
};

export function parseSimonLevel(value: unknown): SimonLevel | null {
  return SIMON_LEVELS.find((level) => level === value) ?? null;
}

export function parseSimonLevelSearch(search: Record<string, unknown>): {
  level: SimonLevel;
} {
  return { level: parseSimonLevel(search.level) ?? DEFAULT_SIMON_LEVEL };
}

export function randomIndex(boardSize: number, rng: Rng): number {
  return Math.floor(rng() * boardSize);
}

export function startSimon(
  level: SimonLevel,
  rng: Rng,
  now: number,
): SimonGame {
  const board = sample(SPECIES, SIMON_BOARD_SIZES[level], rng);

  return {
    level,
    board,
    sequence: [randomIndex(board.length, rng)],
    phase: "loading",
    step: 0,
    lit: false,
    missedIndex: null,
    onHold: false,
    finished: false,
    startedAt: now,
  };
}

export function completedLength(game: SimonGame): number {
  return game.sequence.length - 1;
}

export function boardLoaded(game: SimonGame): SimonGame {
  return game.phase === "loading" ? { ...game, phase: "ready" } : game;
}

export function startWatching(game: SimonGame): SimonGame {
  return game.phase === "ready" && !game.onHold
    ? { ...game, phase: "watch" }
    : game;
}

export function flashMs(game: SimonGame): number {
  return Math.max(
    FASTEST_FLASH_MS,
    SLOWEST_FLASH_MS - FLASH_SPEEDUP_MS * (game.sequence.length - 1),
  );
}

export function playbackDelayMs(game: SimonGame): number {
  if (game.lit) {
    return flashMs(game);
  }

  if (game.step === 0) {
    return SIMON_LEAD_IN_MS;
  }

  return game.step === game.sequence.length ? SIMON_HANDOVER_MS : SIMON_GAP_MS;
}

export function advancePlayback(game: SimonGame): SimonGame {
  if (game.phase !== "watch" || game.onHold) {
    return game;
  }

  if (game.step === game.sequence.length) {
    return { ...game, phase: "repeat", step: 0 };
  }

  return game.lit
    ? { ...game, lit: false, step: game.step + 1 }
    : { ...game, lit: true };
}

export function litIndex(game: SimonGame): number | null {
  return game.phase === "watch" && game.lit ? game.sequence[game.step] : null;
}

export function expectedIndex(game: SimonGame): number | null {
  return game.phase === "over" ? game.sequence[game.step] : null;
}

export function acceptsTap(game: SimonGame): boolean {
  return game.phase === "repeat" && !game.onHold;
}

export function tapSimon(
  game: SimonGame,
  index: number,
  nextIndex: number,
): SimonGame {
  if (!acceptsTap(game)) {
    return game;
  }

  if (index !== game.sequence[game.step]) {
    return { ...game, phase: "over", missedIndex: index };
  }

  const step = game.step + 1;

  if (step < game.sequence.length) {
    return { ...game, step };
  }

  return {
    ...game,
    sequence: [...game.sequence, nextIndex],
    phase: "ready",
    step: 0,
  };
}

export function timeOutSimon(game: SimonGame): SimonGame {
  return acceptsTap(game) ? { ...game, phase: "over" } : game;
}

export function finishSimon(game: SimonGame): SimonGame {
  return game.phase === "over" && !game.onHold
    ? { ...game, finished: true }
    : game;
}

export function holdSimon(game: SimonGame): SimonGame {
  return game.onHold ? game : { ...game, onHold: true };
}

export function releaseSimon(game: SimonGame): SimonGame {
  if (!game.onHold) {
    return game;
  }

  return game.phase === "watch"
    ? { ...game, onHold: false, step: 0, lit: false }
    : { ...game, onHold: false };
}

export const SIMON_SCORE_LABEL = "in a row";

export type SimonBannerText = {
  title: string;
  detail: string | null;
};

export function describeSimonBanner(game: SimonGame): SimonBannerText {
  switch (game.phase) {
    case "loading":
      return { title: "Getting the Pokémon ready…", detail: null };
    case "ready":
      return {
        title: "Get ready!",
        detail: `Round ${game.sequence.length}`,
      };
    case "watch":
      return { title: "Watch closely…", detail: null };
    case "repeat":
      return {
        title: "Your turn!",
        detail: `Tap ${game.step + 1} of ${game.sequence.length}`,
      };
    case "over":
      return {
        title: game.missedIndex === null ? "Too slow!" : "Not that one!",
        detail: null,
      };
    default:
      return game.phase satisfies never;
  }
}

const LEVEL_LABELS: Record<SimonLevel, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export function formatSimonLevel(level: SimonLevel): string {
  return `${LEVEL_LABELS[level]} · ${SIMON_BOARD_SIZES[level]} Pokémon`;
}
