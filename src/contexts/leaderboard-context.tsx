import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useStoredList } from "../hooks/useStoredList";
import {
  addRun,
  RUNS_STORAGE_KEY,
  loadRuns,
  saveRuns,
  type GameRun,
} from "../lib/leaderboard";

export type LeaderboardContextValue = {
  runs: GameRun[];
  recordRun: (run: GameRun) => void;
};

const LeaderboardContext = createContext<LeaderboardContextValue | null>(null);

export function LeaderboardProvider({ children }: { children: ReactNode }) {
  const [runs, commit] = useStoredList({
    key: RUNS_STORAGE_KEY,
    load: loadRuns,
    save: saveRuns,
    saveErrorMessage:
      "Couldn't save your score. Your browser storage is full or blocked.",
  });

  const value = useMemo<LeaderboardContextValue>(
    () => ({
      runs,
      recordRun: (run) => {
        const nextRuns = addRun(runs, run);

        if (nextRuns !== runs) {
          commit(nextRuns);
        }
      },
    }),
    [runs, commit],
  );

  return <LeaderboardContext value={value}>{children}</LeaderboardContext>;
}

export function useLeaderboardContext(): LeaderboardContextValue {
  const context = useContext(LeaderboardContext);

  if (!context) {
    throw new Error(
      "useLeaderboardContext must be used inside LeaderboardProvider",
    );
  }

  return context;
}
