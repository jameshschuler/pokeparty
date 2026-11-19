import { usePagedItems } from "../../hooks/usePagedItems";
import type { ReactNode } from "react";
import type { PokemonSummary } from "../../types/pokemon";

type PagedPokemonGridProps = {
  results: PokemonSummary[];
  renderPokemon: (pokemon: PokemonSummary) => ReactNode;
};

export function PagedPokemonGrid({
  results,
  renderPokemon,
}: PagedPokemonGridProps) {
  const { visibleItems, sentinelRef } = usePagedItems(results);

  return (
    <>
      <ul
        aria-label="Pokémon"
        className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6"
      >
        {visibleItems.map(renderPokemon)}
      </ul>
      <div ref={sentinelRef} aria-hidden />
    </>
  );
}
