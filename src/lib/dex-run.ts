import type { PokemonSummary, Region } from "../types/pokemon";
import { SPECIES } from "./pokedex";
import { formatPokemonLabel, formatPokemonNumber } from "./pokemon";
import {
  buildQuestion,
  FEEDBACK_MS,
  pauseClock,
  pausedClock,
  remainingMs,
  resumeClock,
  type QuizQuestion,
  type RoundClock,
  type Rng,
} from "./quiz";
import { REGION_LABELS } from "./regions";

export const GENERATIONS = [
  { region: "kanto", first: 1, last: 151 },
  { region: "johto", first: 152, last: 251 },
  { region: "hoenn", first: 252, last: 386 },
  { region: "sinnoh", first: 387, last: 493 },
  { region: "unova", first: 494, last: 649 },
  { region: "kalos", first: 650, last: 721 },
  { region: "alola", first: 722, last: 809 },
  { region: "galar", first: 810, last: 905 },
  { region: "paldea", first: 906, last: 1025 },
] as const satisfies { region: Region; first: number; last: number }[];

export type Generation = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type DexRange = "national" | Generation;

export const DEX_RANGES: DexRange[] = ["national", 1, 2, 3, 4, 5, 6, 7, 8, 9];

export const DEFAULT_DEX_RANGE: DexRange = "national";

export const DEX_RUN_LIVES = 3;

export const DEX_RUN_ANSWER_MS = 10_000;

export const DEX_RUN_MISS_REVEAL_MS = 1_500;

export type DexRun = {
  range: DexRange;
  pool: PokemonSummary[];
  index: number;
  question: QuizQuestion;
  upcoming: QuizQuestion | null;
  pickedKey: string | null;
  timedOut: boolean;
  shown: boolean;
  onHold: boolean;
  clock: RoundClock;
  lives: number;
  correct: number;
  finished: boolean;
  startedAt: number;
};

export function parseDexRange(value: unknown): DexRange | null {
  const range = value === "national" ? value : Number(value);

  return DEX_RANGES.find((option) => option === range) ?? null;
}

export function parseDexRangeSearch(search: Record<string, unknown>): {
  range: DexRange;
} {
  return { range: parseDexRange(search.range) ?? DEFAULT_DEX_RANGE };
}

export function dexRangeBounds(range: DexRange): {
  first: number;
  last: number;
} {
  if (range === "national") {
    return { first: GENERATIONS[0].first, last: GENERATIONS.at(-1)!.last };
  }

  const { first, last } = GENERATIONS[range - 1];

  return { first, last };
}

export function dexRangePool(range: DexRange): PokemonSummary[] {
  const { first, last } = dexRangeBounds(range);

  return SPECIES.filter(
    (pokemon) => pokemon.speciesId >= first && pokemon.speciesId <= last,
  );
}

function dexQuestion(
  pool: PokemonSummary[],
  index: number,
  rng: Rng,
): QuizQuestion | null {
  return index < pool.length
    ? buildQuestion("dex", pool[index], pool, rng)
    : null;
}

export function startDexRun(range: DexRange, rng: Rng, now: number): DexRun {
  const pool = dexRangePool(range);

  return {
    range,
    pool,
    index: 0,
    question: dexQuestion(pool, 0, rng)!,
    upcoming: dexQuestion(pool, 1, rng),
    pickedKey: null,
    timedOut: false,
    shown: false,
    onHold: false,
    clock: pausedClock(DEX_RUN_ANSWER_MS, now),
    lives: DEX_RUN_LIVES,
    correct: 0,
    finished: false,
    startedAt: now,
  };
}

export function isRevealed(run: DexRun): boolean {
  return run.pickedKey !== null || run.timedOut;
}

function isOpen(run: DexRun): boolean {
  return run.shown && !run.onHold && !isRevealed(run) && !run.finished;
}

function settleClock(run: DexRun, now: number): DexRun {
  const clock = isOpen(run)
    ? resumeClock(run.clock, now)
    : pauseClock(run.clock, now);

  return clock === run.clock ? run : { ...run, clock };
}

export function showDexQuestion(run: DexRun, now: number): DexRun {
  return run.shown ? run : settleClock({ ...run, shown: true }, now);
}

export function answerDexRun(
  run: DexRun,
  pickedKey: string,
  now: number,
): DexRun {
  if (!isOpen(run) || remainingMs(run.clock, now) === 0) {
    return run;
  }

  const right = pickedKey === run.question.answerKey;

  return settleClock(
    {
      ...run,
      pickedKey,
      correct: right ? run.correct + 1 : run.correct,
      lives: right ? run.lives : run.lives - 1,
    },
    now,
  );
}

export function timeOutDexQuestion(run: DexRun, now: number): DexRun {
  if (!isOpen(run) || remainingMs(run.clock, now) > 0) {
    return run;
  }

  return settleClock({ ...run, timedOut: true, lives: run.lives - 1 }, now);
}

export function advanceDexRun(run: DexRun, rng: Rng, now: number): DexRun {
  if (run.lives === 0 || run.upcoming === null) {
    return { ...run, finished: true };
  }

  return {
    ...run,
    index: run.index + 1,
    question: run.upcoming,
    upcoming: dexQuestion(run.pool, run.index + 2, rng),
    pickedKey: null,
    timedOut: false,
    shown: false,
    clock: pausedClock(DEX_RUN_ANSWER_MS, now),
  };
}

export function skipDexQuestion(run: DexRun, rng: Rng, now: number): DexRun {
  return run.shown ? run : advanceDexRun(run, rng, now);
}

export function holdDexRun(run: DexRun, now: number): DexRun {
  return run.onHold ? run : settleClock({ ...run, onHold: true }, now);
}

export function releaseDexRun(run: DexRun, now: number): DexRun {
  return run.onHold ? settleClock({ ...run, onHold: false }, now) : run;
}

export function revealMs(run: DexRun): number {
  return run.pickedKey === run.question.answerKey
    ? FEEDBACK_MS
    : DEX_RUN_MISS_REVEAL_MS;
}

export function reachedNumber(run: DexRun): number {
  return run.pool[run.index].speciesId;
}

export function clearedRange(run: DexRun): boolean {
  return run.finished && run.lives > 0;
}

export function formatDexRange(range: DexRange): string {
  return range === "national"
    ? "National Dex"
    : `Gen ${range} · ${REGION_LABELS[GENERATIONS[range - 1].region]}`;
}

export function formatDexBounds(range: DexRange): string {
  const { first, last } = dexRangeBounds(range);

  return `${formatPokemonNumber(first)}–${formatPokemonNumber(last)}`;
}

export function describeDexAnswer(run: DexRun): string {
  const { answer } = run.question;
  const reveal = `${formatPokemonNumber(answer.speciesId)} is ${formatPokemonLabel(answer)}!`;

  return run.timedOut ? `Too slow! ${reveal}` : reveal;
}
