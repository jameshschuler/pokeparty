import {
  speciesName,
  stintName,
  type StintChange,
} from "../../lib/playthrough";
import { PokemonSprite } from "../pokemon/PokemonSprite";
import { LevelButton } from "./LevelButton";

export function ChangeLine({ change }: { change: StintChange }) {
  const { stint, update, from } = change;
  const evolved = update.pokemonId !== from;
  const name = stintName(stint, from);

  return (
    <div className="flex min-w-0 items-center gap-2">
      <PokemonSprite
        id={update.pokemonId}
        shiny={stint.shiny}
        alt=""
        className="size-10 shrink-0"
      />
      <span className="min-w-0 flex-1 break-words">
        <span className="font-semibold">{name}</span>{" "}
        <span className="text-ink/70">
          {evolved ? "evolved into" : "leveled up"}
        </span>
        {evolved && (
          <span className="font-semibold">
            {" "}
            {speciesName(update.pokemonId)}
          </span>
        )}
      </span>
      <LevelButton
        stintId={stint.id}
        step={update.step}
        level={update.level}
        label={`${name} ${evolved ? "evolved at" : "reached"}`}
      />
    </div>
  );
}
