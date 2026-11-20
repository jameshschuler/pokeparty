import { createContext, useContext, type ReactNode } from "react";
import {
  addMember,
  currentTeam,
  fixLevel,
  swapOut,
  timelineSteps,
  undoLastStep,
  updateMember,
  type NewMember,
  type StintError,
  type StintResult,
  type TimelineStep,
} from "../lib/playthrough";
import type { Playthrough, TeamStint } from "../types/playthrough";
import { usePlaythroughsContext } from "./playthroughs-context";

export type PlaythroughContextValue = {
  playthrough: Playthrough;
  team: TeamStint[];
  steps: TimelineStep[];
  addMember: (member: NewMember) => StintError | null;
  updateMember: (
    stintId: string,
    level: number,
    pokemonId: number,
  ) => StintError | null;
  swapOut: (
    stintId: string,
    leftLevel: number,
    replacement: NewMember | null,
  ) => StintError | null;
  fixLevel: (stintId: string, step: number, level: number) => StintError | null;
  undo: () => void;
};

const PlaythroughContext = createContext<PlaythroughContextValue | null>(null);

type PlaythroughProviderProps = {
  playthrough: Playthrough;
  children: ReactNode;
};

export function PlaythroughProvider({
  playthrough,
  children,
}: PlaythroughProviderProps) {
  const { updateStints } = usePlaythroughsContext();
  const { stints } = playthrough;

  function apply(result: StintResult): StintError | null {
    if (!result.ok) {
      return result.error;
    }
    updateStints(playthrough.id, result.stints);

    return null;
  }

  return (
    <PlaythroughContext
      value={{
        playthrough,
        team: currentTeam(stints),
        steps: timelineSteps(stints),
        addMember: (member) => apply(addMember(stints, member)),
        updateMember: (stintId, level, pokemonId) =>
          apply(updateMember(stints, stintId, level, pokemonId)),
        swapOut: (stintId, leftLevel, replacement) =>
          apply(swapOut(stints, stintId, leftLevel, replacement)),
        fixLevel: (stintId, step, level) =>
          apply(fixLevel(stints, stintId, step, level)),
        undo: () => updateStints(playthrough.id, undoLastStep(stints)),
      }}
    >
      {children}
    </PlaythroughContext>
  );
}

export function usePlaythroughContext(): PlaythroughContextValue {
  const context = useContext(PlaythroughContext);

  if (!context) {
    throw new Error(
      "usePlaythroughContext must be used inside PlaythroughProvider",
    );
  }

  return context;
}
