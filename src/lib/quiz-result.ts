import {
  isQuizMode,
  parseClockSetting,
  type ClockSetting,
  type QuizMode,
  type QuizRound,
} from "./quiz";

export type QuizResult = {
  mode: QuizMode;
  clock: ClockSetting;
  score: number;
  wrong: number;
  streak: number;
};

export const MAX_RESULT_COUNT = 999;

export function roundResult(round: QuizRound): QuizResult {
  return {
    mode: round.quiz.mode,
    clock: round.clockSetting,
    score: round.quiz.correct,
    wrong: round.quiz.wrong,
    streak: round.quiz.bestStreak,
  };
}

function parseCount(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") {
    return null;
  }

  const count = value === "" ? NaN : Number(value);

  return Number.isInteger(count) && count >= 0 && count <= MAX_RESULT_COUNT
    ? count
    : null;
}

export function parseQuizResult(
  search: Record<string, unknown>,
): QuizResult | null {
  const clock = parseClockSetting(search.clock);
  const score = parseCount(search.score);
  const wrong = parseCount(search.wrong);
  const streak = parseCount(search.streak);

  if (
    !isQuizMode(search.mode) ||
    clock === null ||
    score === null ||
    wrong === null ||
    streak === null ||
    streak > score
  ) {
    return null;
  }

  return { mode: search.mode, clock, score, wrong, streak };
}

export function quizResultUrl(result: QuizResult, origin: string): string {
  const params = new URLSearchParams({
    mode: result.mode,
    clock: String(result.clock),
    score: String(result.score),
    wrong: String(result.wrong),
    streak: String(result.streak),
  });

  return `${origin}/quiz/result?${params}`;
}
