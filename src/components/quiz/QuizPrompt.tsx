import { useQuizContext } from "../../contexts/quiz-context";
import { formatPokemonNumber } from "../../lib/pokemon";
import { describeAnswer, formatPenalty, QUIZ_MODE_RULES } from "../../lib/quiz";
import { QUIZ_MODE_DETAILS } from "./quiz-modes";
import { QuizPromptSprite } from "./QuizPromptSprite";

export function QuizPrompt() {
  const { round, mode } = useQuizContext();
  const revealed = round.quiz.pickedKey !== null;
  const { prompt } = QUIZ_MODE_DETAILS[mode];

  return (
    <div className="border-ink shadow-sticker flex flex-col items-center rounded-3xl border-[3px] bg-white p-4">
      {QUIZ_MODE_RULES[mode].shows === "number" ? (
        <p
          aria-label="Dex number"
          className="text-primary py-2 text-5xl font-bold tabular-nums sm:py-6 sm:text-6xl"
        >
          {round.shown
            ? formatPokemonNumber(round.quiz.current.answer.speciesId)
            : "#????"}
        </p>
      ) : (
        <QuizPromptSprite />
      )}
      <p
        className="flex min-h-8 flex-wrap items-center justify-center gap-x-2 text-center text-xl font-bold"
        aria-live="polite"
      >
        {revealed && <span>{describeAnswer(round.quiz)}</span>}
        {!revealed && prompt && <span className="text-ink/70">{prompt}</span>}
        {round.penaltyMs > 0 && (
          <span className="text-wrong">{formatPenalty(round.penaltyMs)}</span>
        )}
      </p>
    </div>
  );
}
