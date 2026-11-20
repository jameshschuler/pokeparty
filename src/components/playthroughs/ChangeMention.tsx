import {
  speciesName,
  stintName,
  type StintChange,
} from "../../lib/playthrough";
import { PokemonSprite } from "../pokemon/PokemonSprite";
import { LevelButton } from "./LevelButton";

export function ChangeMention({ change }: { change: StintChange }) {
  const { stint, update, from } = change;
  const evolved = update.pokemonId !== from;
  const name = stintName(stint, from);

  return (
    <>
      {evolved && (
        <span aria-hidden className="hidden items-center gap-2 sm:flex">
          <PokemonSprite
            id={from}
            shiny={stint.shiny}
            alt=""
            className="size-9 shrink-0"
          />
          <span className="text-ink/50">→</span>
        </span>
      )}
      <span className="flex min-w-0 items-center gap-2">
        <PokemonSprite
          id={update.pokemonId}
          shiny={stint.shiny}
          alt=""
          className="size-9 shrink-0"
        />
        <span className="min-w-0 break-words">
          <span className="font-semibold">{name}</span>
          {evolved ? (
            <>
              {" evolved into "}
              <span className="font-semibold">
                {speciesName(update.pokemonId)}
              </span>
            </>
          ) : (
            " leveled up"
          )}
        </span>
      </span>
      <LevelButton
        stintId={stint.id}
        step={update.step}
        level={update.level}
        label={`${name} ${evolved ? "evolved at" : "reached"}`}
      />
    </>
  );
}
