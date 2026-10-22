import {
  dexRangeBounds,
  DEX_RUN_LIVES,
  parseDexRange,
  reachedNumber,
  type DexRange,
  type DexRun,
} from "./dex-run";
import { parseCount } from "./parse";

export type DexRunResult = {
  range: DexRange;
  score: number;
  wrong: number;
  reached: number;
};

export function dexRunResult(run: DexRun): DexRunResult {
  return {
    range: run.range,
    score: run.correct,
    wrong: DEX_RUN_LIVES - run.lives,
    reached: reachedNumber(run),
  };
}

export function parseDexRunResult(
  search: Record<string, unknown>,
): DexRunResult | null {
  const range = parseDexRange(search.range);

  if (range === null) {
    return null;
  }

  const { first, last } = dexRangeBounds(range);
  const score = parseCount(search.score, last - first + 1);
  const wrong = parseCount(search.wrong, DEX_RUN_LIVES);
  const reached = parseCount(search.reached, last);

  if (
    score === null ||
    wrong === null ||
    reached === null ||
    reached < first ||
    score > reached - first + 1 ||
    (wrong < DEX_RUN_LIVES && reached !== last)
  ) {
    return null;
  }

  return { range, score, wrong, reached };
}

export function clearedResult(result: DexRunResult): boolean {
  return result.wrong < DEX_RUN_LIVES;
}

export function dexRunResultUrl(result: DexRunResult, origin: string): string {
  const params = new URLSearchParams({
    range: String(result.range),
    score: String(result.score),
    wrong: String(result.wrong),
    reached: String(result.reached),
  });

  return `${origin}/dex-run/result?${params}`;
}
