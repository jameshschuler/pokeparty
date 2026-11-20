import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useStoredList } from "../hooks/useStoredList";
import type { GameId } from "../lib/games";
import { createPlaythrough } from "../lib/playthrough";
import {
  loadPlaythroughs,
  PLAYTHROUGHS_STORAGE_KEY,
  savePlaythroughs,
} from "../lib/playthrough-storage";
import type { Playthrough, TeamStint } from "../types/playthrough";

export type PlaythroughsContextValue = {
  playthroughs: Playthrough[];
  createPlaythrough: (gameId: GameId, name: string) => Playthrough;
  updateStints: (playthroughId: string, stints: TeamStint[]) => void;
  deletePlaythrough: (playthroughId: string) => void;
};

const PlaythroughsContext = createContext<PlaythroughsContextValue | null>(
  null,
);

export function PlaythroughsProvider({ children }: { children: ReactNode }) {
  const [playthroughs, commit] = useStoredList({
    key: PLAYTHROUGHS_STORAGE_KEY,
    load: loadPlaythroughs,
    save: savePlaythroughs,
    saveErrorMessage: "Couldn't save. Your browser storage is full or blocked.",
  });

  const value = useMemo<PlaythroughsContextValue>(() => {
    return {
      playthroughs,
      createPlaythrough: (gameId, name) => {
        const playthrough = createPlaythrough(gameId, name, Date.now());
        commit([playthrough, ...playthroughs]);

        return playthrough;
      },
      updateStints: (playthroughId, stints) => {
        commit(
          playthroughs.map((playthrough) =>
            playthrough.id === playthroughId
              ? { ...playthrough, stints, updatedAt: Date.now() }
              : playthrough,
          ),
        );
      },
      deletePlaythrough: (playthroughId) => {
        commit(
          playthroughs.filter(
            (playthrough) => playthrough.id !== playthroughId,
          ),
        );
      },
    };
  }, [playthroughs, commit]);

  return <PlaythroughsContext value={value}>{children}</PlaythroughsContext>;
}

export function usePlaythroughsContext(): PlaythroughsContextValue {
  const context = useContext(PlaythroughsContext);

  if (!context) {
    throw new Error(
      "usePlaythroughsContext must be used inside PlaythroughsProvider",
    );
  }

  return context;
}
