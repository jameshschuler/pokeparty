import { Link } from "@tanstack/react-router";
import { useLeaderboardContext } from "../../contexts/leaderboard-context";
import {
  boardRuns,
  isNameDropScore,
  type NameDropScore,
} from "../../lib/leaderboard";
import { TEXT_LINK } from "../shared/button-styles";
import { ScoreBoard } from "./ScoreBoard";

function describeNameDropScore(run: NameDropScore): string {
  return `${run.cleared} named`;
}

export function NameDropScores() {
  const { runs } = useLeaderboardContext();
  const board = boardRuns(runs.filter(isNameDropScore), { game: "name-drop" });

  return (
    <ScoreBoard
      runs={board}
      describe={describeNameDropScore}
      playLink={
        <Link to="/name-drop/play" className={TEXT_LINK}>
          Play Name Drop
        </Link>
      }
    />
  );
}
