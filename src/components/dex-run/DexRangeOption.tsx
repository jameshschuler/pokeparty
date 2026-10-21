import { Link } from "@tanstack/react-router";
import { useLeaderboardContext } from "../../contexts/leaderboard-context";
import {
  formatDexBounds,
  formatDexRange,
  type DexRange,
} from "../../lib/dex-run";
import { bestRun } from "../../lib/leaderboard";

export function DexRangeOption({ range }: { range: DexRange }) {
  const { runs } = useLeaderboardContext();
  const best = bestRun(runs, { game: "dex-run", range });

  return (
    <Link
      to="/dex-run/play"
      search={{ range }}
      className="border-ink shadow-sticker-sm flex w-full items-center justify-between gap-3 rounded-2xl border-[3px] bg-white p-4 transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
    >
      <span className="flex flex-col">
        <span className="text-lg font-bold">{formatDexRange(range)}</span>
        <span className="text-ink/70 tabular-nums">
          {formatDexBounds(range)}
        </span>
      </span>
      <span className="text-sm font-semibold whitespace-nowrap">
        Best {best?.score ?? "–"}
      </span>
    </Link>
  );
}
