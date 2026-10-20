import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useLeaderboardContext } from "../../contexts/leaderboard-context";
import { BOARD_SIZE, boardRuns } from "../../lib/leaderboard";
import {
  CLOCK_SETTINGS,
  formatClockSetting,
  QUIZ_MODES,
  type QuizSettings,
} from "../../lib/quiz";
import { BackLink } from "../layout/BackLink";
import { ChipList } from "../shared/ChipList";
import { ChipRow } from "../shared/ChipRow";
import { FilterChip } from "../shared/FilterChip";
import { LeaderboardRow } from "./LeaderboardRow";
import { QUIZ_MODE_DETAILS } from "./quiz-modes";

export function QuizLeaderboard() {
  const { mode, clock } = useSearch({ from: "/quiz/leaderboard" });
  const navigate = useNavigate();
  const { runs } = useLeaderboardContext();
  const board = boardRuns(runs, mode, clock);

  function select(settings: Partial<QuizSettings>) {
    navigate({
      to: "/quiz/leaderboard",
      search: { mode, clock, ...settings },
      replace: true,
    });
  }

  return (
    <section className="mx-auto flex max-w-md flex-col gap-4">
      <BackLink to="/quiz" label="Back" />
      <div>
        <h1 className="text-3xl font-bold">Your scores</h1>
        <p className="text-ink/70 mt-1">
          Your top {BOARD_SIZE} runs for each mode and clock, on this device.
        </p>
      </div>
      <ChipRow>
        <ChipList label="Mode">
          {QUIZ_MODES.map((option) => (
            <li key={option}>
              <FilterChip
                selected={option === mode}
                selectedClassName="bg-accent"
                onClick={() => select({ mode: option })}
              >
                {QUIZ_MODE_DETAILS[option].label}
              </FilterChip>
            </li>
          ))}
        </ChipList>
      </ChipRow>
      <ChipRow>
        <ChipList label="Clock">
          {CLOCK_SETTINGS.map((option) => (
            <li key={option}>
              <FilterChip
                selected={option === clock}
                selectedClassName="bg-accent"
                onClick={() => select({ clock: option })}
              >
                {formatClockSetting(option)}
              </FilterChip>
            </li>
          ))}
        </ChipList>
      </ChipRow>
      {board.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="text-lg font-bold">No runs yet</p>
          <Link
            to="/quiz/play"
            search={{ mode, clock }}
            className="font-semibold underline underline-offset-4"
          >
            Play {QUIZ_MODE_DETAILS[mode].label} · {formatClockSetting(clock)}
          </Link>
        </div>
      ) : (
        <ol className="flex flex-col gap-2" aria-label="Top runs">
          {board.map((run, index) => (
            <LeaderboardRow key={index} run={run} rank={index + 1} />
          ))}
        </ol>
      )}
    </section>
  );
}
