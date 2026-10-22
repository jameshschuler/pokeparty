import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useLeaderboardContext } from "../../contexts/leaderboard-context";
import {
  boardRuns,
  isMatchScore,
  type MatchScore,
} from "../../lib/leaderboard";
import {
  formatMatchLevel,
  formatMatchTime,
  MATCH_LEVELS,
} from "../../lib/match";
import { ChipList } from "../shared/ChipList";
import { ChipRow } from "../shared/ChipRow";
import { FilterChip } from "../shared/FilterChip";
import { TEXT_LINK } from "../shared/button-styles";
import { ScoreBoard } from "./ScoreBoard";

function describeMatchScore(run: MatchScore): string {
  return `flips · ${formatMatchTime(run.timeMs)}`;
}

export function MatchScores() {
  const { level } = useSearch({ from: "/scores/match" });
  const navigate = useNavigate();
  const { runs } = useLeaderboardContext();
  const board = boardRuns(runs.filter(isMatchScore), { game: "match", level });

  return (
    <>
      <ChipRow>
        <ChipList label="Level">
          {MATCH_LEVELS.map((option) => (
            <li key={option}>
              <FilterChip
                selected={option === level}
                selectedClassName="bg-accent"
                onClick={() =>
                  navigate({
                    to: "/scores/match",
                    search: { level: option },
                    replace: true,
                  })
                }
              >
                {formatMatchLevel(option)}
              </FilterChip>
            </li>
          ))}
        </ChipList>
      </ChipRow>
      <ScoreBoard
        runs={board}
        describe={describeMatchScore}
        playLink={
          <Link to="/match/play" search={{ level }} className={TEXT_LINK}>
            Play {formatMatchLevel(level)}
          </Link>
        }
      />
    </>
  );
}
