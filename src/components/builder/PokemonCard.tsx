import { Check } from "lucide-react";
import { useTeamBuilderContext } from "../../contexts/team-builder-context";
import {
  formatMemberName,
  formatPokemonName,
  formatPokemonNumber,
} from "../../lib/pokemon";
import type { PokemonSummary } from "../../types/pokemon";
import { PokemonName } from "../pokemon/PokemonName";
import { PokemonSprite } from "../pokemon/PokemonSprite";
import { ShinyToggle } from "./ShinyToggle";

export function PokemonCard({ pokemon }: { pokemon: PokemonSummary }) {
  const { members, togglePokemon } = useTeamBuilderContext();
  const member = members.find((entry) => entry.pokemonId === pokemon.id);
  const name = formatPokemonName(pokemon.name);

  return (
    <li
      className={`border-ink relative rounded-2xl border-[3px] transition ${
        member
          ? "bg-accent shadow-sticker motion-safe:animate-pop"
          : "shadow-sticker-sm bg-white"
      }`}
    >
      <button
        type="button"
        onClick={() => togglePokemon(pokemon.id)}
        aria-pressed={Boolean(member)}
        aria-label={
          member
            ? `Remove ${formatMemberName(pokemon.name, member.shiny)}`
            : `Add ${name}`
        }
        className="flex w-full flex-col items-center px-1.5 pt-2 pb-2 active:scale-95"
      >
        <PokemonSprite
          id={pokemon.id}
          shiny={member?.shiny ?? false}
          alt=""
          className="w-full"
        />
        <span className="text-ink/60 text-xs font-medium">
          {formatPokemonNumber(pokemon.speciesId)}
        </span>
        <span className="w-full text-sm">
          <PokemonName name={pokemon.name} />
        </span>
      </button>
      {member && (
        <>
          <span className="border-ink bg-primary absolute top-1.5 left-1.5 flex size-6 items-center justify-center rounded-full border-2 text-white">
            <Check className="size-4" strokeWidth={3} aria-hidden />
          </span>
          <ShinyToggle member={member} name={name} />
        </>
      )}
    </li>
  );
}
