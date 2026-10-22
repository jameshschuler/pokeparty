import { Link } from "@tanstack/react-router";
import { useLeaderboardContext } from "../../contexts/leaderboard-context";
import { bestScore } from "../../lib/leaderboard";
import { formatMatchLevel, type MatchLevel } from "../../lib/match";

export function MatchLevelOption({ level }: { level: MatchLevel }) {
  const { runs } = useLeaderboardContext();
  const best = bestScore(runs, { game: "match", level });

  return (
    <Link
      to="/match/play"
      search={{ level }}
      className="border-ink shadow-sticker-sm flex w-full items-center justify-between gap-3 rounded-2xl border-[3px] bg-white p-4 transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
    >
      <span className="text-lg font-bold">{formatMatchLevel(level)}</span>
      <span className="text-sm font-semibold whitespace-nowrap">
        Best {best === null ? "–" : `${best} flips`}
      </span>
    </Link>
  );
}
