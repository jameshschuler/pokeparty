import { X } from "lucide-react";
import { useTeamBuilderContext } from "../../contexts/team-builder-context";
import { usePokemonSummary } from "../../hooks/usePokemonList";
import { formatMemberName } from "../../lib/pokemon";
import type { TeamMember } from "../../types/team";
import { PokemonSprite } from "../pokemon/PokemonSprite";
import { ShinyBadge } from "../pokemon/ShinyBadge";

export function TraySlot({ member }: { member: TeamMember }) {
  const { togglePokemon } = useTeamBuilderContext();
  const pokemon = usePokemonSummary(member.pokemonId);
  const name = pokemon
    ? formatMemberName(pokemon.name, member.shiny)
    : "Pokémon";

  return (
    <button
      type="button"
      onClick={() => togglePokemon(member.pokemonId)}
      aria-label={`Remove ${name}`}
      className="border-ink motion-safe:animate-pop relative aspect-square w-full rounded-full border-[3px] bg-white p-0.5 active:scale-90"
    >
      <PokemonSprite id={member.pokemonId} shiny={member.shiny} alt="" />
      <span className="border-ink absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 bg-white">
        <X className="size-3" strokeWidth={3} aria-hidden />
      </span>
      {member.shiny && <ShinyBadge className="-bottom-1 -left-1 size-5" />}
    </button>
  );
}
