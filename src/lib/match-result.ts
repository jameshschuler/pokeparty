import {
  MATCH_PAIRS,
  parseMatchLevel,
  type MatchGame,
  type MatchLevel,
} from "./match";
import { parseCount } from "./parse";
import { MAX_RESULT_COUNT } from "./quiz-result";

export type MatchResult = {
  level: MatchLevel;
  flips: number;
  timeMs: number;
};

export const MAX_MATCH_TIME_MS = 24 * 60 * 60 * 1000;

export function matchResult(game: MatchGame): MatchResult {
  return {
    level: game.level,
    flips: game.flips,
    timeMs: Math.round(game.elapsedMs),
  };
}

export function parseMatchResult(
  search: Record<string, unknown>,
): MatchResult | null {
  const level = parseMatchLevel(search.level);
  const flips = parseCount(search.flips, MAX_RESULT_COUNT);
  const timeMs = parseCount(search.timeMs, MAX_MATCH_TIME_MS);

  if (
    level === null ||
    flips === null ||
    timeMs === null ||
    flips < MATCH_PAIRS[level] * 2 ||
    flips % 2 !== 0
  ) {
    return null;
  }

  return { level, flips, timeMs };
}

export function matchResultUrl(result: MatchResult, origin: string): string {
  const params = new URLSearchParams({
    level: result.level,
    flips: String(result.flips),
    timeMs: String(result.timeMs),
  });

  return `${origin}/match/result?${params}`;
}
