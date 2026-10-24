import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { nameDropScore } from "../lib/leaderboard";
import {
  advance,
  backspace,
  createNameDrop,
  finishNameDrop,
  holdNameDrop,
  NAME_DROP_FINISH_MS,
  nextEventInMs,
  releaseNameDrop,
  resumeClock,
  startNameDrop,
  stopClock,
  typeText,
  type NameDropGame,
} from "../lib/name-drop";
import { useLeaderboardContext } from "./leaderboard-context";

export type NameDropContextValue = {
  game: NameDropGame;
  start: () => void;
  type: (text: string) => void;
  erase: () => void;
  hold: () => void;
  release: () => void;
  playAgain: () => void;
};

const NameDropContext = createContext<NameDropContextValue | null>(null);

export function NameDropProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState(() =>
    createNameDrop(Date.now(), Date.now()),
  );
  const { recordRun } = useLeaderboardContext();
  const recordedGameRef = useRef<number | null>(null);

  useEffect(() => {
    const scheduledAt = Date.now();
    const delay = nextEventInMs(game, scheduledAt);

    if (delay === null) {
      return;
    }

    const timeout = setTimeout(() => {
      const firedAt = Math.max(Date.now(), scheduledAt + delay);
      setGame((current) => advance(current, firedAt));
    }, delay);

    return () => clearTimeout(timeout);
  }, [game]);

  useEffect(() => {
    function handleVisibility() {
      const changedAt = Date.now();
      setGame((current) =>
        document.hidden
          ? stopClock(advance(current, changedAt), changedAt)
          : resumeClock(current, changedAt),
      );
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    if (game.phase !== "over" || game.finished || game.onHold) {
      return;
    }

    const timeout = setTimeout(
      () => setGame((current) => finishNameDrop(current)),
      NAME_DROP_FINISH_MS,
    );

    return () => clearTimeout(timeout);
  }, [game.phase, game.finished, game.onHold]);

  useEffect(() => {
    if (game.phase !== "over" || recordedGameRef.current === game.startedAt) {
      return;
    }
    recordedGameRef.current = game.startedAt;
    recordRun(nameDropScore(game));
  }, [game, recordRun]);

  function update(
    change: (current: NameDropGame, now: number) => NameDropGame,
  ) {
    const now = Date.now();
    setGame((current) => change(current, now));
  }

  return (
    <NameDropContext
      value={{
        game,
        start: () => update(startNameDrop),
        type: (text) => update((current, now) => typeText(current, text, now)),
        erase: () => update(backspace),
        hold: () => update(holdNameDrop),
        release: () => update(releaseNameDrop),
        playAgain: () => setGame(createNameDrop(Date.now(), Date.now())),
      }}
    >
      {children}
    </NameDropContext>
  );
}

export function useNameDropContext(): NameDropContextValue {
  const context = useContext(NameDropContext);

  if (!context) {
    throw new Error("useNameDropContext must be used inside NameDropProvider");
  }

  return context;
}
