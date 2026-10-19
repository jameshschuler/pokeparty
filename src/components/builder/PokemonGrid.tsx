import { useMemo } from "react";
import { useTeamBuilderContext } from "../../contexts/team-builder-context";
import { usePokemonIdsByType } from "../../hooks/usePokemonIdsByType";
import { usePokemonList } from "../../hooks/usePokemonList";
import { filterPokemon } from "../../lib/pokemon";
import { GridMessage } from "./GridMessage";
import { PagedPokemonGrid } from "./PagedPokemonGrid";

export function PokemonGrid() {
  const { query, type } = useTeamBuilderContext();
  const list = usePokemonList();
  const typeIds = usePokemonIdsByType(type);
  const typeIdSet = type ? typeIds.data : undefined;
  const results = useMemo(
    () => filterPokemon(list.data ?? [], query, typeIdSet),
    [list.data, query, typeIdSet],
  );

  if (list.isPending || (type && typeIds.isPending)) {
    return <GridMessage>Loading Pokémon…</GridMessage>;
  }
  if (list.isError || typeIds.isError) {
    return (
      <GridMessage>
        Couldn't reach PokeAPI. Check your connection and try again.
      </GridMessage>
    );
  }

  if (results.length === 0) {
    return <GridMessage>No Pokémon match that search.</GridMessage>;
  }
  return <PagedPokemonGrid key={`${query}|${type}`} results={results} />;
}
