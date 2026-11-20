import { pokemonIdAt, stintName } from "../../lib/playthrough";
import type { TeamStint } from "../../types/playthrough";
import { PokemonSprite } from "../pokemon/PokemonSprite";
import { LevelButton } from "./LevelButton";

type StintLineProps = {
  stint: TeamStint;
  edge: "joined" | "left";
};

export function StintLine({ stint, edge }: StintLineProps) {
  const step = edge === "joined" ? stint.joinedStep : stint.leftStep;
  const level = edge === "joined" ? stint.joinedLevel : stint.leftLevel;
  const pokemonId = pokemonIdAt(stint, step ?? stint.joinedStep);
  const name = stintName(stint, pokemonId);

  return (
    <div className="flex min-w-0 items-center gap-2">
      <PokemonSprite
        id={pokemonId}
        shiny={stint.shiny}
        alt=""
        className="size-10 shrink-0"
      />
      <span className="min-w-0 flex-1 break-words">
        <span className="font-semibold">{name}</span>{" "}
        <span className="text-ink/70">{edge}</span>
      </span>
      {step !== null && (
        <LevelButton
          stintId={stint.id}
          step={step}
          level={level}
          label={`${name} ${edge} at`}
        />
      )}
    </div>
  );
}
