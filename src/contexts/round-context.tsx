import { createContext, useContext, type ReactNode } from "react";
import type { QuizQuestion } from "../lib/quiz";

export type RoundContextValue = {
  question: QuizQuestion;
  pickedKey: string | null;
  revealed: boolean;
  shown: boolean;
  locked: boolean;
  answer: (choiceKey: string) => void;
  questionShown: () => void;
  skipQuestion: () => void;
  hold: () => void;
  release: () => void;
};

const RoundContext = createContext<RoundContextValue | null>(null);

type RoundProviderProps = {
  value: RoundContextValue;
  children: ReactNode;
};

export function RoundProvider({ value, children }: RoundProviderProps) {
  return <RoundContext value={value}>{children}</RoundContext>;
}

export function useRoundContext(): RoundContextValue {
  const context = useContext(RoundContext);

  if (!context) {
    throw new Error("useRoundContext must be used inside RoundProvider");
  }

  return context;
}
