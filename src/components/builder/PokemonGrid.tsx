import { useMemo } from "react";
import { useTeamBuilderContext } from "../../contexts/team-builder-context";
import { usePokemonIdsByType } from "../../hooks/usePokemonIdsByType";
import { POKEDEX } from "../../lib/pokedex";
import { filterPokemon } from "../../lib/pokemon";
import { GridMessage } from "./GridMessage";
import { PagedPokemonGrid } from "./PagedPokemonGrid";

export function PokemonGrid() {
  const { query, type, region, legendaryOnly } = useTeamBuilderContext();
  const typeIds = usePokemonIdsByType(type);
  const typeIdSet = type ? typeIds.data : undefined;
  const results = useMemo(
    () =>
      filterPokemon(POKEDEX, {
        query,
        typeIds: typeIdSet,
        region,
        legendaryOnly,
      }),
    [query, typeIdSet, region, legendaryOnly],
  );

  if (type && typeIds.isPending) {
    return <GridMessage>Loading Pokémon…</GridMessage>;
  }
  if (typeIds.isError) {
    return (
      <GridMessage>
        Couldn't reach PokeAPI. Check your connection and try again.
      </GridMessage>
    );
  }
  if (results.length === 0) {
    return <GridMessage>No Pokémon match that search.</GridMessage>;
  }
  return <PagedPokemonGrid results={results} />;
}
