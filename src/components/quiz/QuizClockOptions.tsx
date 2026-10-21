import { Link } from "@tanstack/react-router";
import { Timer, Zap } from "lucide-react";
import { useLeaderboardContext } from "../../contexts/leaderboard-context";
import { bestRun } from "../../lib/leaderboard";
import {
  ROUND_SECONDS,
  TIME_ATTACK_BONUS_MS,
  TIME_ATTACK_START_MS,
  type ClockSetting,
  type QuizMode,
} from "../../lib/quiz";
import { PRIMARY_SURFACE } from "../shared/button-styles";

export function QuizClockOptions({ mode }: { mode: QuizMode }) {
  const { runs } = useLeaderboardContext();

  function bestLabel(clock: ClockSetting) {
    return `Best ${bestRun(runs, { game: "quiz", mode, clock })?.score ?? "–"}`;
  }

  return (
    <ul className="grid grid-cols-3 gap-3">
      {ROUND_SECONDS.map((seconds) => (
        <li key={seconds}>
          <Link
            to="/quiz/play"
            search={{ mode, clock: seconds }}
            className={`${PRIMARY_SURFACE} flex-col gap-1 py-4`}
          >
            <Timer className="size-6" aria-hidden />
            <span className="text-2xl font-bold">{seconds}s</span>
            <span className="text-sm">{bestLabel(seconds)}</span>
          </Link>
        </li>
      ))}
      <li className="col-span-3">
        <Link
          to="/quiz/play"
          search={{ mode, clock: "attack" }}
          className={`${PRIMARY_SURFACE} gap-3 px-4 py-4`}
        >
          <Zap className="size-6 shrink-0" aria-hidden />
          <span className="flex flex-col text-left">
            <span className="text-2xl font-bold">Time attack</span>
            <span>
              Start with {TIME_ATTACK_START_MS / 1000}s. Right answers add{" "}
              {TIME_ATTACK_BONUS_MS / 1000}s.
            </span>
            <span className="text-sm">{bestLabel("attack")}</span>
          </span>
        </Link>
      </li>
    </ul>
  );
}
