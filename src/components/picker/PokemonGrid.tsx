import { useMemo, type ReactNode } from "react";
import { usePokemonPickerContext } from "../../contexts/pokemon-picker-context";
import { usePokemonIdsByType } from "../../hooks/usePokemonIdsByType";
import { POKEDEX } from "../../lib/pokedex";
import { filterPokemon } from "../../lib/pokemon";
import type { PokemonSummary } from "../../types/pokemon";
import { GridMessage } from "./GridMessage";
import { PagedPokemonGrid } from "./PagedPokemonGrid";

type PokemonGridProps = {
  renderPokemon: (pokemon: PokemonSummary) => ReactNode;
};

export function PokemonGrid({ renderPokemon }: PokemonGridProps) {
  const { query, type, gameLimit } = usePokemonPickerContext();
  const pool = gameLimit ? gameLimit.pokemon : POKEDEX;
  const typeIds = usePokemonIdsByType(type);
  const typeIdSet = type ? typeIds.data : undefined;
  const results = useMemo(
    () => filterPokemon(pool, { query, typeIds: typeIdSet }),
    [pool, query, typeIdSet],
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
    return (
      <GridMessage>
        {gameLimit
          ? `No Pokémon in ${gameLimit.gameName} match that search.`
          : "No Pokémon match that search."}
      </GridMessage>
    );
  }

  return <PagedPokemonGrid results={results} renderPokemon={renderPokemon} />;
}
