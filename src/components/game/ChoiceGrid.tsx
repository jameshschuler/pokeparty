import { useRef, useState } from "react";
import { useRoundContext } from "../../contexts/round-context";
import { useLoadTimeout } from "../../hooks/useLoadTimeout";
import { SPRITE_LOAD_TIMEOUT_MS } from "../../lib/quiz";
import { ChoiceButton } from "./ChoiceButton";
import { SkipQuestion } from "./SkipQuestion";

export function ChoiceGrid() {
  const { question, shown, questionShown } = useRoundContext();
  const spriteCount = question.choices.filter(
    (choice) => choice.kind === "sprite",
  ).length;
  const loadedKeys = useRef(new Set<string>());
  const [failed, setFailed] = useState(false);
  const timedOut = useLoadTimeout(
    spriteCount === 0 || shown,
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
      {question.choices.map((choice, index) => (
        <li key={choice.key}>
          <ChoiceButton
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
