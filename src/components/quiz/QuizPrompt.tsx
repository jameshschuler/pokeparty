import { SkipForward } from "lucide-react";
import { useState } from "react";
import { useQuizContext } from "../../contexts/quiz-context";
import { formatPokemonLabel } from "../../lib/pokemon";
import { PokemonSprite } from "../pokemon/PokemonSprite";

export function QuizPrompt() {
  const { round, questionShown, skipQuestion } = useQuizContext();
  const [failed, setFailed] = useState(false);
  const { answer } = round.quiz.current;
  const revealed = round.quiz.pickedId !== null;

  return (
    <div className="border-ink shadow-sticker flex flex-col items-center rounded-3xl border-[3px] bg-white p-4">
      {failed ? (
        <div className="flex aspect-square w-48 flex-col items-center justify-center gap-3 text-center sm:w-60">
          <p className="font-semibold">Couldn't load this Pokémon.</p>
          <button
            type="button"
            onClick={skipQuestion}
            className="border-ink shadow-sticker-sm flex min-h-11 items-center gap-1.5 rounded-full border-[3px] bg-white px-4 font-semibold"
          >
            <SkipForward className="size-5" aria-hidden />
            Skip
          </button>
        </div>
      ) : (
        <PokemonSprite
          id={answer.id}
          shiny={false}
          alt="Mystery Pokémon"
          className="w-48 sm:w-60"
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
