import { pokemonIdAt, stintName } from "../../lib/playthrough";
import type { TeamStint } from "../../types/playthrough";
import { PokemonSprite } from "../pokemon/PokemonSprite";
import { LevelButton } from "./LevelButton";

type StintMentionProps = {
  stint: TeamStint;
  edge: "joined" | "left";
  step: number;
  showVerb?: boolean;
};

export function StintMention({
  stint,
  edge,
  step,
  showVerb = true,
}: StintMentionProps) {
  const level = edge === "joined" ? stint.joinedLevel : stint.leftLevel;
  const pokemonId = pokemonIdAt(stint, step);
  const name = stintName(stint, pokemonId);

  return (
    <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
      <span className="flex min-w-0 items-center gap-2">
        <PokemonSprite
          id={pokemonId}
          shiny={stint.shiny}
          alt=""
          className={`size-9 shrink-0 ${edge === "left" ? "opacity-60" : ""}`}
        />
        <span className="min-w-0 break-words">
          <span className="font-semibold">{name}</span>
          {showVerb && <span> {edge}</span>}
        </span>
      </span>
      <LevelButton
        stintId={stint.id}
        step={step}
        level={level}
        label={`${name} ${edge} at`}
      />
    </span>
  );
}
