import { usePokemonPickerContext } from "../../contexts/pokemon-picker-context";
import { formatMemberName, formatPokemonNumber } from "../../lib/pokemon";
import type { PokemonSummary } from "../../types/pokemon";
import { PokemonName } from "../pokemon/PokemonName";
import { PokemonSprite } from "../pokemon/PokemonSprite";

type PickCardProps = {
  pokemon: PokemonSummary;
  onPick: (pokemon: PokemonSummary) => void;
};

export function PickCard({ pokemon, onPick }: PickCardProps) {
  const { shinyMode } = usePokemonPickerContext();

  return (
    <li className="border-ink shadow-sticker-sm rounded-2xl border-[3px] bg-white">
      <button
        type="button"
        onClick={() => onPick(pokemon)}
        aria-label={`Pick ${formatMemberName(pokemon, shinyMode)}`}
        className="flex w-full flex-col items-center px-1.5 pt-2 pb-2 active:scale-95"
      >
        <PokemonSprite
          id={pokemon.id}
          shiny={shinyMode}
          alt=""
          className="w-full"
        />
        <span className="text-ink/60 text-xs font-medium">
          {formatPokemonNumber(pokemon.speciesId)}
        </span>
        <span className="w-full text-sm">
          <PokemonName pokemon={pokemon} />
        </span>
      </button>
    </li>
  );
}
