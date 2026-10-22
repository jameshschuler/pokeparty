import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useLeaderboardContext } from "../../contexts/leaderboard-context";
import { boardRuns, isSimonScore } from "../../lib/leaderboard";
import {
  formatSimonLevel,
  SIMON_LEVELS,
  SIMON_SCORE_LABEL,
} from "../../lib/simon";
import { ChipList } from "../shared/ChipList";
import { ChipRow } from "../shared/ChipRow";
import { FilterChip } from "../shared/FilterChip";
import { TEXT_LINK } from "../shared/button-styles";
import { ScoreBoard } from "./ScoreBoard";

export function SimonScores() {
  const { level } = useSearch({ from: "/scores/simon" });
  const navigate = useNavigate();
  const { runs } = useLeaderboardContext();
  const board = boardRuns(runs.filter(isSimonScore), { game: "simon", level });

  return (
    <>
      <ChipRow>
        <ChipList label="Level">
          {SIMON_LEVELS.map((option) => (
            <li key={option}>
              <FilterChip
                selected={option === level}
                selectedClassName="bg-accent"
                onClick={() =>
                  navigate({
                    to: "/scores/simon",
                    search: { level: option },
                    replace: true,
                  })
                }
              >
                {formatSimonLevel(option)}
              </FilterChip>
            </li>
          ))}
        </ChipList>
      </ChipRow>
      <ScoreBoard
        runs={board}
        describe={() => SIMON_SCORE_LABEL}
        playLink={
          <Link to="/simon/play" search={{ level }} className={TEXT_LINK}>
            Play {formatSimonLevel(level)}
          </Link>
        }
      />
    </>
  );
}
