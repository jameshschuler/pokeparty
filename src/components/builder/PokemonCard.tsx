import { Check } from "lucide-react";
import { useTeamBuilderContext } from "../../contexts/team-builder-context";
import { formatPokemonName, formatPokemonNumber } from "../../lib/pokemon";
import type { PokemonSummary } from "../../types/pokemon";
import { PokemonName } from "../pokemon/PokemonName";
import { PokemonSprite } from "../pokemon/PokemonSprite";

export function PokemonCard({ pokemon }: { pokemon: PokemonSummary }) {
  const { pokemonIds, togglePokemon } = useTeamBuilderContext();
  const selected = pokemonIds.includes(pokemon.id);
  const name = formatPokemonName(pokemon.name);

  return (
    <li
      className={`border-ink relative rounded-2xl border-[3px] transition ${
        selected
          ? "bg-accent shadow-sticker motion-safe:animate-pop"
          : "shadow-sticker-sm bg-white"
      }`}
    >
      <button
        type="button"
        onClick={() => togglePokemon(pokemon.id)}
        aria-pressed={selected}
        aria-label={selected ? `Remove ${name}` : `Add ${name}`}
        className="flex w-full flex-col items-center px-1.5 pt-2 pb-2 active:scale-95"
      >
        <PokemonSprite id={pokemon.id} alt="" className="w-full" />
        <span className="text-ink/60 text-xs font-medium">
          {formatPokemonNumber(pokemon.speciesId)}
        </span>
        <span className="w-full text-sm">
          <PokemonName name={pokemon.name} />
        </span>
      </button>
      {selected && (
        <span className="border-ink bg-primary absolute top-1.5 left-1.5 flex size-6 items-center justify-center rounded-full border-2 text-white">
          <Check className="size-4" strokeWidth={3} aria-hidden />
        </span>
      )}
    </li>
  );
}
