import { X } from "lucide-react";
import { useTeamBuilderContext } from "../../contexts/team-builder-context";
import { usePokemonSummary } from "../../hooks/usePokemonList";
import { formatPokemonName } from "../../lib/pokemon";
import { PokemonSprite } from "../pokemon/PokemonSprite";

export function TraySlot({ pokemonId }: { pokemonId: number }) {
  const { togglePokemon } = useTeamBuilderContext();
  const pokemon = usePokemonSummary(pokemonId);
  const label = pokemon ? formatPokemonName(pokemon.name) : "Pokémon";

  return (
    <button
      type="button"
      onClick={() => togglePokemon(pokemonId)}
      aria-label={`Remove ${label}`}
      className="border-ink motion-safe:animate-pop relative aspect-square w-full rounded-full border-[3px] bg-white p-0.5 active:scale-90"
    >
      <PokemonSprite id={pokemonId} alt="" />
      <span className="border-ink absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 bg-white">
        <X className="size-3" strokeWidth={3} aria-hidden />
      </span>
    </button>
  );
}
