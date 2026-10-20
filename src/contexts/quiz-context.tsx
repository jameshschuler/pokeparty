import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { SPECIES } from "../lib/pokedex";
import { spriteUrl } from "../lib/pokemon";
import {
  answerRound,
  createRng,
  holdRound,
  isRoundOver,
  FEEDBACK_MS,
  nextQuestion,
  releaseRound,
  remainingMs,
  showQuestion,
  startRound,
  type QuizMode,
  type QuizRound,
  type RoundSeconds,
} from "../lib/quiz";

export type QuizContextValue = {
  round: QuizRound;
  mode: QuizMode;
  seconds: RoundSeconds;
  finished: boolean;
  waiting: boolean;
  answer: (pokemonId: number) => void;
  questionShown: () => void;
  skipQuestion: () => void;
  hold: () => void;
  release: () => void;
  playAgain: () => void;
};

const QuizContext = createContext<QuizContextValue | null>(null);

type QuizProviderProps = {
  mode: QuizMode;
  seconds: RoundSeconds;
  children: ReactNode;
};

export function QuizProvider({ mode, seconds, children }: QuizProviderProps) {
  const [rng] = useState(() => createRng(Date.now()));
  const [round, setRound] = useState(() =>
    startRound(SPECIES, rng, seconds, Date.now()),
  );
  const [checkedAt, setCheckedAt] = useState(Date.now);
  const finished = isRoundOver(round, checkedAt);
  const waiting = !round.shown;

  useEffect(() => {
    if (round.clock.pausedAt !== null) {
      return;
    }

    const timeout = setTimeout(
      () => setCheckedAt(Date.now()),
      remainingMs(round.clock, Date.now()),
    );

    return () => clearTimeout(timeout);
  }, [round.clock]);

  useEffect(() => {
    if (round.quiz.pickedId === null || round.onHold || finished) {
      return;
    }

    const timeout = setTimeout(() => {
      const advancedAt = Date.now();
      setRound((current) => nextQuestion(current, SPECIES, rng, advancedAt));
    }, FEEDBACK_MS);

    return () => clearTimeout(timeout);
  }, [round.quiz.pickedId, round.onHold, finished, rng]);

  useEffect(() => {
    new Image().src = spriteUrl(round.quiz.upcoming.answer.id, false);
  }, [round.quiz.upcoming]);

  function answer(pokemonId: number) {
    const answeredAt = Date.now();
    setRound((current) => answerRound(current, pokemonId, answeredAt));
  }

  function questionShown() {
    const shownAt = Date.now();
    setRound((current) => showQuestion(current, shownAt));
  }

  function skipQuestion() {
    const skippedAt = Date.now();
    setRound((current) =>
      !current.shown ? nextQuestion(current, SPECIES, rng, skippedAt) : current,
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
    setRound(startRound(SPECIES, rng, seconds, Date.now()));
  }

  return (
    <QuizContext
      value={{
        round,
        mode,
        seconds,
        finished,
        waiting,
        answer,
        questionShown,
        skipQuestion,
        hold,
        release,
        playAgain,
      }}
    >
      {children}
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
