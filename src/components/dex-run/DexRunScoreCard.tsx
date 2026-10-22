import { dexRangeBounds, formatDexRange } from "../../lib/dex-run";
import { clearedResult, type DexRunResult } from "../../lib/dex-run-result";
import { formatPokemonNumber } from "../../lib/pokemon";

export function DexRunScoreCard({ result }: { result: DexRunResult }) {
  const { first, last } = dexRangeBounds(result.range);

  return (
    <>
      <p>
        <span className="text-primary block text-6xl font-bold">
          {result.score}
        </span>
        named · {formatDexRange(result.range)}
      </p>
      <p className="bg-surface rounded-2xl px-4 py-2 font-semibold">
        {clearedResult(result)
          ? `Cleared all ${last - first + 1}!`
          : `Reached ${formatPokemonNumber(result.reached)} of ${formatPokemonNumber(last)}`}
      </p>
    </>
  );
}
