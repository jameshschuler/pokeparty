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
  FEEDBACK_MS,
  isWaitingForQuestion,
  nextQuestion,
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
  const finished = remainingMs(round.clock, checkedAt) === 0;
  const waiting = isWaitingForQuestion(round);

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
    if (round.quiz.pickedId === null || finished) {
      return;
    }

    const timeout = setTimeout(
      () => setRound((current) => nextQuestion(current, SPECIES, rng)),
      FEEDBACK_MS,
    );

    return () => clearTimeout(timeout);
  }, [round.quiz.pickedId, finished, rng]);

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
    setRound((current) =>
      isWaitingForQuestion(current)
        ? nextQuestion(current, SPECIES, rng)
        : current,
    );
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
