import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useLeaderboardContext } from "../../contexts/leaderboard-context";
import { DEX_RANGES, formatDexRange } from "../../lib/dex-run";
import {
  boardRuns,
  isDexRunScore,
  type DexRunScore,
} from "../../lib/leaderboard";
import { formatPokemonNumber } from "../../lib/pokemon";
import { ChipList } from "../shared/ChipList";
import { ChipRow } from "../shared/ChipRow";
import { FilterChip } from "../shared/FilterChip";
import { ScoreBoard } from "./ScoreBoard";
import { TEXT_LINK } from "../shared/button-styles";

function describeDexRunScore(run: DexRunScore): string {
  return `Reached ${formatPokemonNumber(run.reached)} · ${run.wrong} missed`;
}

export function DexRunScores() {
  const { range } = useSearch({ from: "/scores/dex-run" });
  const navigate = useNavigate();
  const { runs } = useLeaderboardContext();
  const board = boardRuns(runs.filter(isDexRunScore), {
    game: "dex-run",
    range,
  });

  return (
    <>
      <ChipRow>
        <ChipList label="Dex">
          {DEX_RANGES.map((option) => (
            <li key={option}>
              <FilterChip
                selected={option === range}
                selectedClassName="bg-accent"
                onClick={() =>
                  navigate({
                    to: "/scores/dex-run",
                    search: { range: option },
                    replace: true,
                  })
                }
              >
                {formatDexRange(option)}
              </FilterChip>
            </li>
          ))}
        </ChipList>
      </ChipRow>
      <ScoreBoard
        runs={board}
        describe={describeDexRunScore}
        playLink={
          <Link to="/dex-run/play" search={{ range }} className={TEXT_LINK}>
            Play {formatDexRange(range)}
          </Link>
        }
      />
    </>
  );
}
