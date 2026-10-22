import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useCries, type Cries } from "../hooks/useCries";
import { matchScore } from "../lib/leaderboard";
import {
  boardLoaded,
  finishMatch,
  flipCard,
  hideMiss,
  holdMatch,
  isMiss,
  MATCH_FINISH_MS,
  MATCH_MISS_MS,
  matchedCryCard,
  releaseMatch,
  resumeClock,
  startMatch,
  stopClock,
  type MatchGame,
  type MatchLevel,
} from "../lib/match";
import { createRng } from "../lib/random";
import { useLeaderboardContext } from "./leaderboard-context";

export type MatchContextValue = {
  game: MatchGame;
  sound: Pick<Cries, "supported" | "muted" | "toggleMuted" | "unlock">;
  flip: (index: number) => void;
  loaded: () => void;
  hold: () => void;
  release: () => void;
  playAgain: () => void;
};

const MatchContext = createContext<MatchContextValue | null>(null);

type MatchProviderProps = {
  level: MatchLevel;
  children: ReactNode;
};

export function MatchProvider({ level, children }: MatchProviderProps) {
  const [rng] = useState(() => createRng(Date.now()));
  const [game, setGame] = useState(() => startMatch(level, rng, Date.now()));
  const { recordRun } = useLeaderboardContext();
  const recordedGameRef = useRef<number | null>(null);
  const showingMiss = isMiss(game) && !game.onHold;
  const { play, stop, ...sound } = useCries(
    game.cards.map((card) => card.pokemon.speciesId),
  );
  const matchedCard = matchedCryCard(game);

  useEffect(() => {
    if (matchedCard !== null) {
      play(matchedCard);
    }
  }, [matchedCard, play]);

  useEffect(() => {
    if (game.phase !== "done" || game.finished || game.onHold) {
      return;
    }

    const timeout = setTimeout(
      () => setGame((current) => finishMatch(current)),
      MATCH_FINISH_MS,
    );

    return () => clearTimeout(timeout);
  }, [game.phase, game.finished, game.onHold]);

  useEffect(() => {
    if (!showingMiss) {
      return;
    }

    const timeout = setTimeout(
      () => setGame((current) => hideMiss(current)),
      MATCH_MISS_MS,
      matchedCryCard,
    );

    return () => clearTimeout(timeout);
  }, [showingMiss, game.faceUp]);

  useEffect(() => {
    function handleVisibility() {
      const changedAt = Date.now();
      setGame((current) =>
        document.hidden
          ? stopClock(current, changedAt)
          : resumeClock(current, changedAt),
      );
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    if (game.phase !== "done" || recordedGameRef.current === game.startedAt) {
      return;
    }
    recordedGameRef.current = game.startedAt;
    recordRun(matchScore(game));
  }, [game, recordRun]);

  function flip(index: number) {
    const flippedAt = Date.now();
    setGame((current) => flipCard(current, index, flippedAt));
  }

  function hold() {
    stop();
    const heldAt = Date.now();
    setGame((current) => holdMatch(current, heldAt));
  }

  function release() {
    const releasedAt = Date.now();
    setGame((current) => releaseMatch(current, releasedAt));
  }

  return (
    <MatchContext
      value={{
        game,
        sound,
        flip,
        loaded: () => setGame((current) => boardLoaded(current)),
        hold,
        release,
        playAgain: () => setGame(startMatch(level, rng, Date.now())),
      }}
    >
      {children}
    </MatchContext>
  );
}

export function useMatchContext(): MatchContextValue {
  const context = useContext(MatchContext);

  if (!context) {
    throw new Error("useMatchContext must be used inside MatchProvider");
  }

  return context;
}
