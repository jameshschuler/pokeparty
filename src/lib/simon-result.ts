import { parseCount } from "./parse";
import { MAX_RESULT_COUNT } from "./quiz-result";
import {
  parseSimonLevel,
  completedLength,
  type SimonGame,
  type SimonLevel,
} from "./simon";

export type SimonResult = {
  level: SimonLevel;
  score: number;
};

export function simonResult(game: SimonGame): SimonResult {
  return { level: game.level, score: completedLength(game) };
}

export function parseSimonResult(
  search: Record<string, unknown>,
): SimonResult | null {
  const level = parseSimonLevel(search.level);
  const score = parseCount(search.score, MAX_RESULT_COUNT);

  if (level === null || score === null) {
    return null;
  }

  return { level, score };
}

export function simonResultUrl(result: SimonResult, origin: string): string {
  const params = new URLSearchParams({
    level: result.level,
    score: String(result.score),
  });

  return `${origin}/simon/result?${params}`;
}
