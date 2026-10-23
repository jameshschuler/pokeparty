import {
  LONGEST_TYPED_NAME,
  NAME_DROP_MAX_MULTIPLIER,
  NAME_DROP_POINTS_PER_LETTER,
  SHORTEST_TYPED_NAME,
  type NameDropGame,
} from "./name-drop";
import { parseCount } from "./parse";

export type NameDropResult = {
  score: number;
  cleared: number;
};

export const MAX_NAME_DROP_CLEARED = 9_999;

const MAX_POINTS_PER_CLEAR =
  LONGEST_TYPED_NAME * NAME_DROP_POINTS_PER_LETTER * NAME_DROP_MAX_MULTIPLIER;

const MIN_POINTS_PER_CLEAR = SHORTEST_TYPED_NAME * NAME_DROP_POINTS_PER_LETTER;

export function nameDropResult(game: NameDropGame): NameDropResult {
  return { score: game.score, cleared: game.cleared };
}

export function parseNameDropResult(
  search: Record<string, unknown>,
): NameDropResult | null {
  const cleared = parseCount(search.cleared, MAX_NAME_DROP_CLEARED);
  const score = parseCount(
    search.score,
    MAX_NAME_DROP_CLEARED * MAX_POINTS_PER_CLEAR,
  );

  if (
    cleared === null ||
    score === null ||
    score % NAME_DROP_POINTS_PER_LETTER !== 0 ||
    score < cleared * MIN_POINTS_PER_CLEAR ||
    score > cleared * MAX_POINTS_PER_CLEAR
  ) {
    return null;
  }

  return { score, cleared };
}

export function nameDropResultUrl(
  result: NameDropResult,
  origin: string,
): string {
  const params = new URLSearchParams({
    score: String(result.score),
    cleared: String(result.cleared),
  });

  return `${origin}/name-drop/result?${params}`;
}
