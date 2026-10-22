import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  advanceDexRun,
  answerDexRun,
  holdDexRun,
  isRevealed,
  releaseDexRun,
  revealMs,
  showDexQuestion,
  skipDexQuestion,
  startDexRun,
  timeOutDexQuestion,
  type DexRange,
  type DexRun,
} from "../lib/dex-run";
import { dexRunScore } from "../lib/leaderboard";
import { spriteUrl } from "../lib/pokemon";
import { questionSpriteIds, remainingMs } from "../lib/quiz";
import { createRng } from "../lib/random";
import { useLeaderboardContext } from "./leaderboard-context";
import { RoundProvider } from "./round-context";

export type DexRunContextValue = {
  run: DexRun;
  playAgain: () => void;
};

const DexRunContext = createContext<DexRunContextValue | null>(null);

type DexRunProviderProps = {
  range: DexRange;
  children: ReactNode;
};

export function DexRunProvider({ range, children }: DexRunProviderProps) {
  const [rng] = useState(() => createRng(Date.now()));
  const [run, setRun] = useState(() => startDexRun(range, rng, Date.now()));
  const revealed = isRevealed(run);
  const revealDelay = revealMs(run);
  const { recordRun } = useLeaderboardContext();
  const recordedRunRef = useRef<number | null>(null);

  useEffect(() => {
    if (run.clock.pausedAt !== null) {
      return;
    }

    const { endsAt } = run.clock;
    const timeout = setTimeout(
      () => {
        const expiredAt = Math.max(Date.now(), endsAt);
        setRun((current) => timeOutDexQuestion(current, expiredAt));
      },
      remainingMs(run.clock, Date.now()),
    );

    return () => clearTimeout(timeout);
  }, [run.clock]);

  useEffect(() => {
    if (!revealed || run.onHold || run.finished) {
      return;
    }

    const timeout = setTimeout(() => {
      const advancedAt = Date.now();
      setRun((current) => advanceDexRun(current, rng, advancedAt));
    }, revealDelay);

    return () => clearTimeout(timeout);
  }, [revealed, run.onHold, run.finished, revealDelay, rng]);

  useEffect(() => {
    if (!run.upcoming) {
      return;
    }

    for (const id of questionSpriteIds("dex", run.upcoming)) {
      new Image().src = spriteUrl(id, false);
    }
  }, [run.upcoming]);

  useEffect(() => {
    if (!run.finished || recordedRunRef.current === run.startedAt) {
      return;
    }
    recordedRunRef.current = run.startedAt;
    recordRun(dexRunScore(run));
  }, [run, recordRun]);

  function answer(choiceKey: string) {
    const answeredAt = Date.now();
    setRun((current) => answerDexRun(current, choiceKey, answeredAt));
  }

  function questionShown() {
    const shownAt = Date.now();
    setRun((current) => showDexQuestion(current, shownAt));
  }

  function skipQuestion() {
    const skippedAt = Date.now();
    setRun((current) => skipDexQuestion(current, rng, skippedAt));
  }

  function hold() {
    const heldAt = Date.now();
    setRun((current) => holdDexRun(current, heldAt));
  }

  function release() {
    const releasedAt = Date.now();
    setRun((current) => releaseDexRun(current, releasedAt));
  }

  function playAgain() {
    setRun(startDexRun(range, rng, Date.now()));
  }

  return (
    <DexRunContext value={{ run, playAgain }}>
      <RoundProvider
        value={{
          question: run.question,
          pickedKey: run.pickedKey,
          ruledOutKeys: run.ruledOutKeys,
          revealed,
          shown: run.shown,
          finished: run.finished,
          answer,
          questionShown,
          skipQuestion,
          hold,
          release,
        }}
      >
        {children}
      </RoundProvider>
    </DexRunContext>
  );
}

export function useDexRunContext(): DexRunContextValue {
  const context = useContext(DexRunContext);

  if (!context) {
    throw new Error("useDexRunContext must be used inside DexRunProvider");
  }

  return context;
}
