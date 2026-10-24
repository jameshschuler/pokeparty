import { useCallback } from "react";
import { typedDisplayLength } from "../../lib/pokemon";
import { NAME_DROP_LANES, type Drop } from "../../lib/name-drop";
import { PokemonSprite } from "../pokemon/PokemonSprite";
import { LONG_NAME_LENGTH } from "./name-drop-styles";

type FallingPokemonProps = {
  drop: Drop;
  typedCount: number;
  register: (id: number, element: HTMLElement | null) => void;
};

export function FallingPokemon({
  drop,
  typedCount,
  register,
}: FallingPokemonProps) {
  const ref = useCallback(
    (element: HTMLElement | null) => register(drop.id, element),
    [register, drop.id],
  );
  const name = drop.pokemon.displayName;
  const done = typedDisplayLength(name, typedCount);
  const locked = typedCount > 0;

  return (
    <div
      ref={ref}
      className="absolute top-0 flex flex-col items-center will-change-transform"
      style={{
        width: `${100 / NAME_DROP_LANES}%`,
        left: `${(drop.lane * 100) / NAME_DROP_LANES}%`,
      }}
    >
      <PokemonSprite
        id={drop.pokemon.id}
        shiny={false}
        alt=""
        className={`w-14 ${locked ? "drop-shadow-[0_0_6px_var(--color-primary)]" : ""}`}
        eager
      />
      <span
        className={`border-ink rounded-full border-2 bg-white px-2 font-bold whitespace-nowrap ${name.length > LONG_NAME_LENGTH ? "text-[11px]" : "text-sm"} ${locked ? "outline-primary outline-2" : ""}`}
      >
        <span className="text-primary">{name.slice(0, done)}</span>
        {name.slice(done)}
      </span>
    </div>
  );
}
