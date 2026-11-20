import { speciesName } from "../../lib/playthrough";
import type { PokemonSummary } from "../../types/pokemon";
import { PokemonSprite } from "../pokemon/PokemonSprite";
import { FilterChip } from "../shared/FilterChip";

type EvolutionChoiceProps = {
  currentId: number;
  evolutions: PokemonSummary[];
  value: number;
  onChange: (pokemonId: number) => void;
};

export function EvolutionChoice({
  currentId,
  evolutions,
  value,
  onChange,
}: EvolutionChoiceProps) {
  const options = [
    { id: currentId, label: `Still ${speciesName(currentId)}` },
    ...evolutions.map((pokemon) => ({
      id: pokemon.id,
      label: speciesName(pokemon.id),
    })),
  ];

  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 font-semibold">Evolved into</legend>
      <ul aria-label="Evolved into" className="flex flex-wrap gap-2">
        {options.map((option) => (
          <li key={option.id} className="min-w-0">
            <FilterChip
              selected={option.id === value}
              selectedClassName="bg-primary text-white"
              onClick={() => onChange(option.id)}
            >
              <PokemonSprite
                id={option.id}
                shiny={false}
                alt=""
                className="-my-1 size-7"
              />
              {option.label}
            </FilterChip>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}
