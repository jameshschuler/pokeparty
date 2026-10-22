import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { roundRun } from "../lib/leaderboard";
import { quizPool } from "../lib/pokedex";
import { spriteUrl } from "../lib/pokemon";
import {
  answerRound,
  holdRound,
  isRoundOver,
  FEEDBACK_MS,
  nextQuestion,
  questionSpriteIds,
  releaseRound,
  remainingMs,
  showQuestion,
  startRound,
  type ClockSetting,
  type QuizMode,
  type QuizRound,
} from "../lib/quiz";
import { createRng } from "../lib/random";
import { useLeaderboardContext } from "./leaderboard-context";
import { RoundProvider } from "./round-context";

export type QuizContextValue = {
  round: QuizRound;
  mode: QuizMode;
  clockSetting: ClockSetting;
  finished: boolean;
  playAgain: () => void;
};

const QuizContext = createContext<QuizContextValue | null>(null);

type QuizProviderProps = {
  mode: QuizMode;
  clock: ClockSetting;
  children: ReactNode;
};

export function QuizProvider({ mode, clock, children }: QuizProviderProps) {
  const [rng] = useState(() => createRng(Date.now()));
  const [round, setRound] = useState(() =>
    startRound(quizPool(mode), rng, { mode, clock }, Date.now()),
  );
  const [checkedAt, setCheckedAt] = useState(Date.now);
  const finished = isRoundOver(round, checkedAt);
  const { recordRun } = useLeaderboardContext();
  const recordedRoundRef = useRef<number | null>(null);

  useEffect(() => {
    if (!finished || recordedRoundRef.current === round.startedAt) {
      return;
    }
    recordedRoundRef.current = round.startedAt;
    recordRun(roundRun(round));
  }, [finished, round, recordRun]);

  useEffect(() => {
    if (round.clock.pausedAt !== null) {
      return;
    }

    const { endsAt } = round.clock;
    const timeout = setTimeout(
      () => setCheckedAt(Math.max(Date.now(), endsAt)),
      remainingMs(round.clock, Date.now()),
    );

    return () => clearTimeout(timeout);
  }, [round.clock]);

  useEffect(() => {
    if (round.quiz.pickedKey === null || round.onHold || finished) {
      return;
    }

    const timeout = setTimeout(() => {
      const advancedAt = Date.now();
      setRound((current) => nextQuestion(current, rng, advancedAt));
    }, FEEDBACK_MS);

    return () => clearTimeout(timeout);
  }, [round.quiz.pickedKey, round.onHold, finished, rng]);

  useEffect(() => {
    for (const id of questionSpriteIds(round.quiz.mode, round.quiz.upcoming)) {
      new Image().src = spriteUrl(id, false);
    }
  }, [round.quiz.mode, round.quiz.upcoming]);

  function answer(choiceKey: string) {
    const answeredAt = Date.now();
    setRound((current) => answerRound(current, choiceKey, answeredAt));
  }

  function questionShown() {
    const shownAt = Date.now();
    setRound((current) => showQuestion(current, shownAt));
  }

  function skipQuestion() {
    const skippedAt = Date.now();
    setRound((current) =>
      !current.shown ? nextQuestion(current, rng, skippedAt) : current,
    );
  }

  function hold() {
    const heldAt = Date.now();
    setRound((current) => holdRound(current, heldAt));
  }

  function release() {
    const releasedAt = Date.now();
    setRound((current) => releaseRound(current, releasedAt));
  }

  function playAgain() {
    setRound(startRound(quizPool(mode), rng, { mode, clock }, Date.now()));
  }

  return (
    <QuizContext
      value={{
        round,
        mode: round.quiz.mode,
        clockSetting: round.clockSetting,
        finished,
        playAgain,
      }}
    >
      <RoundProvider
        value={{
          question: round.quiz.current,
          pickedKey: round.quiz.pickedKey,
          revealed: round.quiz.pickedKey !== null,
          shown: round.shown,
          finished,
          answer,
          questionShown,
          skipQuestion,
          hold,
          release,
        }}
      >
        {children}
      </RoundProvider>
    </QuizContext>
  );
}

export function useQuizContext(): QuizContextValue {
  const context = useContext(QuizContext);

  if (!context) {
    throw new Error("useQuizContext must be used inside QuizProvider");
  }

  return context;
}
