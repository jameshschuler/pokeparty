import { useRoundContext } from "../../contexts/round-context";
import type { QuizChoice } from "../../lib/quiz";
import { PokemonSprite } from "../pokemon/PokemonSprite";
import { choiceStyle } from "./game-styles";

type ChoiceButtonProps = {
  choice: QuizChoice;
  position: number;
  onSpriteLoad: (key: string) => void;
  onSpriteError: () => void;
};

export function ChoiceButton({
  choice,
  position,
  onSpriteLoad,
  onSpriteError,
}: ChoiceButtonProps) {
  const {
    question,
    pickedKey,
    ruledOutKeys = [],
    revealed,
    locked,
    answer,
  } = useRoundContext();
  const ruledOut = ruledOutKeys.includes(choice.key);
  const named = revealed || ruledOut;
  const style = choiceStyle(
    choice.key === question.answerKey,
    choice.key === pickedKey,
    ruledOut,
    revealed,
  );

  return (
    <button
      type="button"
      onClick={() => answer(choice.key)}
      disabled={locked || ruledOut}
      aria-label={
        choice.kind === "sprite" && !named ? `Choice ${position}` : undefined
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
            {named ? choice.label : ""}
          </span>
        </>
      ) : (
        choice.label
      )}
    </button>
  );
}
