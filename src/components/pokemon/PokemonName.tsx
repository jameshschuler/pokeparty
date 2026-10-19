import { pokemonNameParts } from "../../lib/pokemon";

export function PokemonName({ name }: { name: string }) {
  const parts = pokemonNameParts(name);

  return (
    <span className="flex w-full flex-col items-center text-center leading-tight">
      <span className="line-clamp-2 font-semibold">{parts.name}</span>
      {parts.variant && (
        <span className="text-ink/60 text-xs font-medium">{parts.variant}</span>
      )}
    </span>
  );
}
