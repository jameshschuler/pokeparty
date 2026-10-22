import type { ReactNode } from "react";
import { displayScore, type GameRun } from "../../lib/leaderboard";
import { ScoreRow } from "./ScoreRow";

type ScoreBoardProps<T extends GameRun> = {
  runs: T[];
  describe: (run: T) => string;
  playLink: ReactNode;
};

export function ScoreBoard<T extends GameRun>({
  runs,
  describe,
  playLink,
}: ScoreBoardProps<T>) {
  if (runs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <p className="text-lg font-bold">No runs yet</p>
        {playLink}
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-2" aria-label="Top runs">
      {runs.map((run, index) => (
        <ScoreRow
          key={index}
          rank={index + 1}
          score={displayScore(run)}
          detail={describe(run)}
          playedAt={run.playedAt}
        />
      ))}
    </ol>
  );
}
