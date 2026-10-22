import { Link } from "@tanstack/react-router";
import { useLeaderboardContext } from "../../contexts/leaderboard-context";
import { bestRun } from "../../lib/leaderboard";
import { formatSimonLevel, type SimonLevel } from "../../lib/simon";

export function SimonLevelOption({ level }: { level: SimonLevel }) {
  const { runs } = useLeaderboardContext();
  const best = bestRun(runs, { game: "simon", level });

  return (
    <Link
      to="/simon/play"
      search={{ level }}
      className="border-ink shadow-sticker-sm flex w-full items-center justify-between gap-3 rounded-2xl border-[3px] bg-white p-4 transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
    >
      <span className="text-lg font-bold">{formatSimonLevel(level)}</span>
      <span className="text-sm font-semibold whitespace-nowrap">
        Best {best?.score ?? "–"}
      </span>
    </Link>
  );
}
