import type { DexRun } from "./dex-run";
import {
  dexRunResult,
  parseDexRunResult,
  type DexRunResult,
} from "./dex-run-result";
import type { QuizRound } from "./quiz";
import { parseQuizResult, roundResult, type QuizResult } from "./quiz-result";
import { loadStoredList } from "./storage";

export type QuizRun = { game: "quiz" } & QuizResult & { playedAt: number };

export type DexRunScore = { game: "dex-run" } & DexRunResult & {
    playedAt: number;
  };

export type GameRun = QuizRun | DexRunScore;

export type Board =
  | Pick<QuizRun, "game" | "mode" | "clock">
  | Pick<DexRunScore, "game" | "range">;

export const BOARD_SIZE = 10;

export const RUNS_STORAGE_KEY = "pokeparty:quiz-runs";

export function roundRun(round: QuizRound): QuizRun {
  return { game: "quiz", ...roundResult(round), playedAt: round.startedAt };
}

export function dexRunScore(run: DexRun): DexRunScore {
  return { game: "dex-run", ...dexRunResult(run), playedAt: run.startedAt };
}

export function isQuizRun(run: GameRun): run is QuizRun {
  return run.game === "quiz";
}

export function isDexRunScore(run: GameRun): run is DexRunScore {
  return run.game === "dex-run";
}

function boardKey(board: Board): string {
  return board.game === "quiz"
    ? `quiz:${board.mode}:${board.clock}`
    : `dex-run:${board.range}`;
}

function isOnBoard(run: GameRun, board: Board): boolean {
  return boardKey(run) === boardKey(board);
}

function isSameRun(a: GameRun, b: GameRun): boolean {
  return a.playedAt === b.playedAt && isOnBoard(a, b);
}

function compareRuns(a: GameRun, b: GameRun): number {
  return b.score - a.score || a.wrong - b.wrong || a.playedAt - b.playedAt;
}

export function boardRuns<T extends GameRun>(runs: T[], board: Board): T[] {
  return runs
    .filter((run) => isOnBoard(run, board))
    .sort(compareRuns)
    .slice(0, BOARD_SIZE);
}

export function bestRun<T extends GameRun>(runs: T[], board: Board): T | null {
  return boardRuns(runs, board)[0] ?? null;
}

function boardIndex(runs: GameRun[], run: GameRun): number {
  return boardRuns(runs, run).findIndex((stored) => isSameRun(stored, run));
}

export function addRun(runs: GameRun[], run: GameRun): GameRun[] {
  if (run.score === 0 || runs.some((stored) => isSameRun(stored, run))) {
    return runs;
  }

  const withRun = [...runs, run];

  if (boardIndex(withRun, run) === -1) {
    return runs;
  }

  return [
    ...runs.filter((stored) => !isOnBoard(stored, run)),
    ...boardRuns(withRun, run),
  ];
}

export function runRank(runs: GameRun[], run: GameRun): number | null {
  const index = boardIndex(addRun(runs, run), run);

  return index === -1 ? null : index + 1;
}

function parseDexRunScore(
  run: Record<string, unknown>,
  playedAt: number,
): DexRunScore | null {
  const result = parseDexRunResult(run);

  if (!result) {
    return null;
  }

  return { game: "dex-run", ...result, playedAt };
}

function parseStoredRun(value: unknown): GameRun | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const run = value as Record<string, unknown>;

  if (typeof run.playedAt !== "number") {
    return null;
  }

  if (run.game === "dex-run") {
    return parseDexRunScore(run, run.playedAt);
  }

  const result =
    run.game === undefined || run.game === "quiz" ? parseQuizResult(run) : null;

  if (!result) {
    return null;
  }

  return { game: "quiz", ...result, playedAt: run.playedAt };
}

export function loadRuns(): GameRun[] {
  return loadStoredList(RUNS_STORAGE_KEY, parseStoredRun);
}

export function saveRuns(runs: GameRun[]): void {
  localStorage.setItem(RUNS_STORAGE_KEY, JSON.stringify(runs));
}

export function formatPlayedAt(playedAt: number): string {
  return new Date(playedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
