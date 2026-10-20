import { SkipForward } from "lucide-react";
import { useState } from "react";
import { useQuizContext } from "../../contexts/quiz-context";
import { formatPokemonLabel } from "../../lib/pokemon";
import { isPokemonHidden } from "../../lib/quiz";
import { PokemonSprite } from "../pokemon/PokemonSprite";
import { PILL_BUTTON } from "../shared/button-styles";

export function QuizPrompt() {
  const { round, mode, questionShown, skipQuestion } = useQuizContext();
  const [failed, setFailed] = useState(false);
  const { answer } = round.quiz.current;
  const revealed = round.quiz.pickedId !== null;
  const hidden = isPokemonHidden(mode, revealed);

  return (
    <div className="border-ink shadow-sticker flex flex-col items-center rounded-3xl border-[3px] bg-white p-4">
      {failed ? (
        <div className="flex aspect-square w-48 flex-col items-center justify-center gap-3 text-center sm:w-60">
          <p className="font-semibold">Couldn't load this Pokémon.</p>
          <button type="button" onClick={skipQuestion} className={PILL_BUTTON}>
            <SkipForward className="size-5" aria-hidden />
            Skip
          </button>
        </div>
      ) : (
        <PokemonSprite
          id={answer.id}
          shiny={false}
          alt="Mystery Pokémon"
          className={`w-48 transition-[filter] duration-200 sm:w-60 ${hidden ? "brightness-0" : ""}`}
          eager
          onLoad={questionShown}
          onError={() => setFailed(true)}
        />
      )}
      <p className="h-8 text-xl font-bold" aria-live="polite">
        {revealed ? `It's ${formatPokemonLabel(answer)}!` : ""}
      </p>
    </div>
  );
}
