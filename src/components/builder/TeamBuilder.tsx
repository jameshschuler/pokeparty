import { PickerFilters } from "../picker/PickerFilters";
import { PokemonGrid } from "../picker/PokemonGrid";
import { PokemonCard } from "./PokemonCard";
import { TeamTray } from "./TeamTray";

export function TeamBuilder() {
  return (
    <div className="-mt-4 flex flex-col gap-3">
      <h1 className="sr-only">Build your team</h1>
      <PickerFilters />
      <PokemonGrid
        renderPokemon={(pokemon) => (
          <PokemonCard key={pokemon.id} pokemon={pokemon} />
        )}
      />
      <TeamTray />
    </div>
  );
}
