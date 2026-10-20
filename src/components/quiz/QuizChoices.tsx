import { useQuizContext } from "../../contexts/quiz-context";
import { formatPokemonLabel } from "../../lib/pokemon";
import { choiceStyle } from "./quiz-styles";

export function QuizChoices() {
  const { round, finished, waiting, answer } = useQuizContext();
  const { quiz } = round;
  const revealed = quiz.pickedId !== null;

  return (
    <ul className="grid grid-cols-2 gap-3">
      {quiz.current.choices.map((choice) => (
        <li key={choice.id}>
          <button
            type="button"
            onClick={() => answer(choice.id)}
            disabled={revealed || finished || waiting}
            className={`border-ink flex min-h-14 w-full items-center justify-center rounded-2xl border-[3px] px-2 text-lg leading-tight font-semibold transition ${choiceStyle(
              choice.id === quiz.current.answer.id,
              choice.id === quiz.pickedId,
              revealed,
            )}`}
          >
            {formatPokemonLabel(choice)}
          </button>
        </li>
      ))}
    </ul>
  );
}
