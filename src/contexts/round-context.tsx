import { createContext, useContext, type ReactNode } from "react";
import type { QuizQuestion } from "../lib/quiz";

type RoundState = {
  question: QuizQuestion;
  pickedKey: string | null;
  ruledOutKeys?: string[];
  revealed: boolean;
  shown: boolean;
  finished: boolean;
  answer: (choiceKey: string) => void;
  questionShown: () => void;
  skipQuestion: () => void;
  hold: () => void;
  release: () => void;
};

export type RoundContextValue = RoundState & { locked: boolean };

const RoundContext = createContext<RoundContextValue | null>(null);

type RoundProviderProps = {
  value: RoundState;
  children: ReactNode;
};

export function RoundProvider({ value, children }: RoundProviderProps) {
  const locked = value.revealed || value.finished || !value.shown;

  return <RoundContext value={{ ...value, locked }}>{children}</RoundContext>;
}

export function useRoundContext(): RoundContextValue {
  const context = useContext(RoundContext);

  if (!context) {
    throw new Error("useRoundContext must be used inside RoundProvider");
  }

  return context;
}
