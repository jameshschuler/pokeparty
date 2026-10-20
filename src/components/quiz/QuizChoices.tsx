import { useRef, useState } from "react";
import { useQuizContext } from "../../contexts/quiz-context";
import { useLoadTimeout } from "../../hooks/useLoadTimeout";
import { SPRITE_LOAD_TIMEOUT_MS } from "../../lib/quiz";
import { QuizChoiceButton } from "./QuizChoiceButton";
import { SkipQuestion } from "./SkipQuestion";

export function QuizChoices() {
  const { round, questionShown } = useQuizContext();
  const { choices } = round.quiz.current;
  const spriteCount = choices.filter(
    (choice) => choice.kind === "sprite",
  ).length;
  const loadedKeys = useRef(new Set<string>());
  const [failed, setFailed] = useState(false);
  const timedOut = useLoadTimeout(
    spriteCount === 0 || round.shown,
    SPRITE_LOAD_TIMEOUT_MS,
  );

  function handleSpriteLoad(key: string) {
    loadedKeys.current.add(key);

    if (loadedKeys.current.size === spriteCount) {
      questionShown();
    }
  }

  if (failed || timedOut) {
    return <SkipQuestion message="Couldn't load these Pokémon." />;
  }

  return (
    <ul className="grid grid-cols-2 gap-3">
      {choices.map((choice, index) => (
        <li key={choice.key}>
          <QuizChoiceButton
            choice={choice}
            position={index + 1}
            onSpriteLoad={handleSpriteLoad}
            onSpriteError={() => setFailed(true)}
          />
        </li>
      ))}
    </ul>
  );
}
