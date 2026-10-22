import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { simonScore } from "../lib/leaderboard";
import { createRng } from "../lib/random";
import {
  advancePlayback,
  boardLoaded,
  finishSimon,
  holdSimon,
  playbackDelayMs,
  randomIndex,
  releaseSimon,
  SIMON_IDLE_MS,
  SIMON_REVEAL_MS,
  startSimon,
  tapSimon,
  timeOutSimon,
  type SimonGame,
  type SimonLevel,
} from "../lib/simon";
import { useLeaderboardContext } from "./leaderboard-context";

export type SimonContextValue = {
  game: SimonGame;
  tap: (index: number) => void;
  loaded: () => void;
  hold: () => void;
  release: () => void;
  playAgain: () => void;
};

const SimonContext = createContext<SimonContextValue | null>(null);

type SimonProviderProps = {
  level: SimonLevel;
  children: ReactNode;
};

export function SimonProvider({ level, children }: SimonProviderProps) {
  const [rng] = useState(() => createRng(Date.now()));
  const [game, setGame] = useState(() => startSimon(level, rng, Date.now()));
  const { recordRun } = useLeaderboardContext();
  const recordedGameRef = useRef<number | null>(null);
  const playing = game.phase === "watch" && !game.onHold;
  const waitingForTap = game.phase === "repeat" && !game.onHold;
  const delay = playbackDelayMs(game);

  useEffect(() => {
    if (!playing) {
      return;
    }

    const timeout = setTimeout(
      () => setGame((current) => advancePlayback(current)),
      delay,
    );

    return () => clearTimeout(timeout);
  }, [playing, game.step, game.lit, delay]);

  useEffect(() => {
    if (!waitingForTap) {
      return;
    }

    const timeout = setTimeout(
      () => setGame((current) => timeOutSimon(current)),
      SIMON_IDLE_MS,
    );

    return () => clearTimeout(timeout);
  }, [waitingForTap, game.step]);

  useEffect(() => {
    if (game.phase !== "over" || game.finished || game.onHold) {
      return;
    }

    const timeout = setTimeout(
      () => setGame((current) => finishSimon(current)),
      SIMON_REVEAL_MS,
    );

    return () => clearTimeout(timeout);
  }, [game.phase, game.finished, game.onHold]);

  useEffect(() => {
    if (!game.finished || recordedGameRef.current === game.startedAt) {
      return;
    }
    recordedGameRef.current = game.startedAt;
    recordRun(simonScore(game));
  }, [game, recordRun]);

  return (
    <SimonContext
      value={{
        game,
        tap: (index) => {
          const nextIndex = randomIndex(game.board.length, rng);
          setGame((current) => tapSimon(current, index, nextIndex));
        },
        loaded: () => setGame((current) => boardLoaded(current)),
        hold: () => setGame((current) => holdSimon(current)),
        release: () => setGame((current) => releaseSimon(current)),
        playAgain: () => setGame(startSimon(level, rng, Date.now())),
      }}
    >
      {children}
    </SimonContext>
  );
}

export function useSimonContext(): SimonContextValue {
  const context = useContext(SimonContext);

  if (!context) {
    throw new Error("useSimonContext must be used inside SimonProvider");
  }

  return context;
}
