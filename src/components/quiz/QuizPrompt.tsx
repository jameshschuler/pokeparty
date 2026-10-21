import { useQuizContext } from "../../contexts/quiz-context";
import {
  describeAnswer,
  formatClockDelta,
  QUIZ_MODE_RULES,
} from "../../lib/quiz";
import { QUIZ_MODE_DETAILS } from "./quiz-modes";
import { DexNumber } from "../game/DexNumber";
import { QuizPromptSprite } from "./QuizPromptSprite";

export function QuizPrompt() {
  const { round, mode } = useQuizContext();
  const revealed = round.quiz.pickedKey !== null;
  const { prompt } = QUIZ_MODE_DETAILS[mode];
  const clockDelta = formatClockDelta(round.clockDeltaMs);

  return (
    <div className="border-ink shadow-sticker flex flex-col items-center rounded-3xl border-[3px] bg-white p-4">
      {QUIZ_MODE_RULES[mode].shows === "number" ? (
        <DexNumber />
      ) : (
        <QuizPromptSprite />
      )}
      <p
        className="flex min-h-8 flex-wrap items-center justify-center gap-x-2 text-center text-xl font-bold"
        aria-live="polite"
      >
        {revealed && <span>{describeAnswer(round.quiz)}</span>}
        {!revealed && prompt && <span className="text-ink/70">{prompt}</span>}
        {clockDelta && (
          <span
            className={round.clockDeltaMs > 0 ? "text-correct" : "text-wrong"}
          >
            {clockDelta}
          </span>
        )}
      </p>
    </div>
  );
}
