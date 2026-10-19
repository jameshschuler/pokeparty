import { formatPokemonNumber } from "../../lib/pokemon";
import type { PokemonSummary } from "../../types/pokemon";
import { PokemonName } from "../pokemon/PokemonName";
import { PokemonSprite } from "../pokemon/PokemonSprite";

export function SharedPokemon({ pokemon }: { pokemon: PokemonSummary }) {
  return (
    <li className="border-ink shadow-sticker-sm flex flex-col items-center rounded-2xl border-[3px] bg-white p-2">
      <PokemonSprite id={pokemon.id} alt="" className="w-full" />
      <span className="text-ink/60 text-xs font-medium">
        {formatPokemonNumber(pokemon.speciesId)}
      </span>
      <PokemonName name={pokemon.name} />
    </li>
  );
}
