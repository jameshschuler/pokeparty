import { findPokemon } from "../../lib/pokedex";
import { formatPokemonNumber } from "../../lib/pokemon";
import type { TeamMember } from "../../types/team";
import { PokemonName } from "../pokemon/PokemonName";
import { PokemonSprite } from "../pokemon/PokemonSprite";
import { ShinyBadge } from "../pokemon/ShinyBadge";

export function SharedPokemon({ member }: { member: TeamMember }) {
  const pokemon = findPokemon(member.pokemonId);

  if (!pokemon) {
    return null;
  }

  return (
    <li className="border-ink shadow-sticker-sm relative flex flex-col items-center rounded-2xl border-[3px] bg-white p-2">
      <PokemonSprite
        id={pokemon.id}
        shiny={member.shiny}
        alt=""
        className="w-full"
      />
      <span className="text-ink/60 text-xs font-medium">
        {formatPokemonNumber(pokemon.speciesId)}
      </span>
      <PokemonName pokemon={pokemon} />
      {member.shiny && (
        <>
          <ShinyBadge className="top-2 right-2 size-7" />
          <span className="sr-only">Shiny</span>
        </>
      )}
    </li>
  );
}
