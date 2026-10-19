import type { PokemonSummary } from "../../types/pokemon";

export function PokemonName({ pokemon }: { pokemon: PokemonSummary }) {
  return (
    <span className="flex w-full flex-col items-center text-center leading-tight">
      <span className="line-clamp-2 font-semibold">{pokemon.displayName}</span>
      {pokemon.variant && (
        <span className="text-ink/60 text-xs font-medium">
          {pokemon.variant}
        </span>
      )}
    </span>
  );
}
