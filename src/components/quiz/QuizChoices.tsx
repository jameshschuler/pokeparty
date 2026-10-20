import { useQuizContext } from "../../contexts/quiz-context";
import { choiceStyle } from "./quiz-styles";

export function QuizChoices() {
  const { round, finished, waiting, answer } = useQuizContext();
  const { quiz } = round;
  const revealed = quiz.pickedKey !== null;

  return (
    <ul className="grid grid-cols-2 gap-3">
      {quiz.current.choices.map((choice) => (
        <li key={choice.key}>
          <button
            type="button"
            onClick={() => answer(choice.key)}
            disabled={revealed || finished || waiting}
            className={`border-ink flex min-h-14 w-full items-center justify-center rounded-2xl border-[3px] px-2 text-lg leading-tight font-semibold transition ${choiceStyle(
              choice.key === quiz.current.answerKey,
              choice.key === quiz.pickedKey,
              revealed,
            )}`}
          >
            {choice.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
