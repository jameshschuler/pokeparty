import { formatMatchLevel, formatMatchTime } from "../../lib/match";
import type { MatchResult } from "../../lib/match-result";

export function MatchScoreCard({ result }: { result: MatchResult }) {
  return (
    <>
      <p>
        <span className="text-primary block text-6xl font-bold">
          {result.flips}
        </span>
        flips · {formatMatchLevel(result.level)}
      </p>
      <p className="bg-surface rounded-2xl px-4 py-2 font-semibold">
        Time {formatMatchTime(result.timeMs)}
      </p>
    </>
  );
}
