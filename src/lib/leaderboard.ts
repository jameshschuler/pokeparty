import type { ClockSetting, QuizMode, QuizRound } from "./quiz";
import { parseQuizResult, roundResult, type QuizResult } from "./quiz-result";
import { loadStoredList } from "./storage";

export type QuizRun = QuizResult & { playedAt: number };

export const BOARD_SIZE = 10;

export const LEADERBOARD_STORAGE_KEY = "pokeparty:quiz-runs";

export function roundRun(round: QuizRound): QuizRun {
  return { ...roundResult(round), playedAt: round.startedAt };
}

function isOnBoard(run: QuizRun, mode: QuizMode, clock: ClockSetting): boolean {
  return run.mode === mode && run.clock === clock;
}

function isSameRun(a: QuizRun, b: QuizRun): boolean {
  return a.playedAt === b.playedAt && isOnBoard(a, b.mode, b.clock);
}

function compareRuns(a: QuizRun, b: QuizRun): number {
  return b.score - a.score || a.wrong - b.wrong || a.playedAt - b.playedAt;
}

export function boardRuns(
  runs: QuizRun[],
  mode: QuizMode,
  clock: ClockSetting,
): QuizRun[] {
  return runs
    .filter((run) => isOnBoard(run, mode, clock))
    .sort(compareRuns)
    .slice(0, BOARD_SIZE);
}

export function bestRun(
  runs: QuizRun[],
  mode: QuizMode,
  clock: ClockSetting,
): QuizRun | null {
  return boardRuns(runs, mode, clock)[0] ?? null;
}

function boardIndex(runs: QuizRun[], run: QuizRun): number {
  return boardRuns(runs, run.mode, run.clock).findIndex((stored) =>
    isSameRun(stored, run),
  );
}

export function addRun(runs: QuizRun[], run: QuizRun): QuizRun[] {
  if (run.score === 0 || runs.some((stored) => isSameRun(stored, run))) {
    return runs;
  }

  const withRun = [...runs, run];

  if (boardIndex(withRun, run) === -1) {
    return runs;
  }

  return [
    ...runs.filter((stored) => !isOnBoard(stored, run.mode, run.clock)),
    ...boardRuns(withRun, run.mode, run.clock),
  ];
}

export function runRank(runs: QuizRun[], run: QuizRun): number | null {
  const index = boardIndex(addRun(runs, run), run);

  return index === -1 ? null : index + 1;
}

function parseStoredRun(value: unknown): QuizRun | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const run = value as Record<string, unknown>;
  const result = parseQuizResult(run);

  if (!result || typeof run.playedAt !== "number") {
    return null;
  }

  return { ...result, playedAt: run.playedAt };
}

export function loadRuns(): QuizRun[] {
  return loadStoredList(LEADERBOARD_STORAGE_KEY, parseStoredRun);
}

export function saveRuns(runs: QuizRun[]): void {
  localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(runs));
}

export function formatPlayedAt(playedAt: number): string {
  return new Date(playedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
