import { useQuizContext } from "../../contexts/quiz-context";
import type { QuizChoice } from "../../lib/quiz";
import { PokemonSprite } from "../pokemon/PokemonSprite";
import { choiceStyle } from "./quiz-styles";

type QuizChoiceButtonProps = {
  choice: QuizChoice;
  position: number;
  onSpriteLoad: (key: string) => void;
  onSpriteError: () => void;
};

export function QuizChoiceButton({
  choice,
  position,
  onSpriteLoad,
  onSpriteError,
}: QuizChoiceButtonProps) {
  const { round, finished, waiting, answer } = useQuizContext();
  const { quiz } = round;
  const revealed = quiz.pickedKey !== null;
  const style = choiceStyle(
    choice.key === quiz.current.answerKey,
    choice.key === quiz.pickedKey,
    revealed,
  );

  return (
    <button
      type="button"
      onClick={() => answer(choice.key)}
      disabled={revealed || finished || waiting}
      aria-label={
        choice.kind === "sprite" && !revealed ? `Choice ${position}` : undefined
      }
      className={`border-ink flex w-full flex-col items-center justify-center rounded-2xl border-[3px] font-semibold transition ${
        choice.kind === "sprite" ? "p-2" : "min-h-14 px-2 text-lg leading-tight"
      } ${style}`}
    >
      {choice.kind === "sprite" ? (
        <>
          <PokemonSprite
            id={choice.pokemonId}
            shiny={false}
            alt=""
            className="w-24 sm:w-32"
            eager
            onLoad={() => onSpriteLoad(choice.key)}
            onError={onSpriteError}
          />
          <span className="min-h-6 text-sm leading-tight">
            {revealed ? choice.label : ""}
          </span>
        </>
      ) : (
        choice.label
      )}
    </button>
  );
}
