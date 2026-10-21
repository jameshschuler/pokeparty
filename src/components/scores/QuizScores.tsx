import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useLeaderboardContext } from "../../contexts/leaderboard-context";
import { boardRuns, isQuizRun, type QuizRun } from "../../lib/leaderboard";
import {
  accuracy,
  CLOCK_SETTINGS,
  formatClockSetting,
  QUIZ_MODES,
  type QuizSettings,
} from "../../lib/quiz";
import { QUIZ_MODE_DETAILS } from "../quiz/quiz-modes";
import { ChipList } from "../shared/ChipList";
import { ChipRow } from "../shared/ChipRow";
import { FilterChip } from "../shared/FilterChip";
import { ScoreBoard } from "./ScoreBoard";
import { TEXT_LINK } from "../shared/button-styles";

function describeQuizRun(run: QuizRun): string {
  return `${accuracy(run.score, run.wrong)}% · streak ${run.streak}`;
}

export function QuizScores() {
  const { mode, clock } = useSearch({ from: "/scores/quiz" });
  const navigate = useNavigate();
  const { runs } = useLeaderboardContext();
  const board = boardRuns(runs.filter(isQuizRun), {
    game: "quiz",
    mode,
    clock,
  });

  function select(settings: Partial<QuizSettings>) {
    navigate({
      to: "/scores/quiz",
      search: { mode, clock, ...settings },
      replace: true,
    });
  }

  return (
    <>
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
      <ScoreBoard
        runs={board}
        describe={describeQuizRun}
        playLink={
          <Link to="/quiz/play" search={{ mode, clock }} className={TEXT_LINK}>
            Play {QUIZ_MODE_DETAILS[mode].label} · {formatClockSetting(clock)}
          </Link>
        }
      />
    </>
  );
}
