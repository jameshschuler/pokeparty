import { useState } from "react";
import { useQuizContext } from "../../contexts/quiz-context";
import { useRoundContext } from "../../contexts/round-context";
import { useLoadTimeout } from "../../hooks/useLoadTimeout";
import { isPokemonHidden, SPRITE_LOAD_TIMEOUT_MS } from "../../lib/quiz";
import { PokemonSprite } from "../pokemon/PokemonSprite";
import { SkipQuestion } from "../game/SkipQuestion";

export function QuizPromptSprite() {
  const { round } = useQuizContext();
  const { question, shown, questionShown } = useRoundContext();
  const [failed, setFailed] = useState(false);
  const timedOut = useLoadTimeout(shown, SPRITE_LOAD_TIMEOUT_MS);

  if (failed || timedOut) {
    return (
      <div className="flex aspect-square w-48 flex-col items-center justify-center text-center sm:w-60">
        <SkipQuestion message="Couldn't load this Pokémon." />
      </div>
    );
  }

  return (
    <PokemonSprite
      id={question.answer.id}
      shiny={false}
      alt="Mystery Pokémon"
      className={`w-48 transition-[filter] duration-200 sm:w-60 ${isPokemonHidden(round.quiz) ? "brightness-0" : ""}`}
      eager
      onLoad={questionShown}
      onError={() => setFailed(true)}
    />
  );
}
