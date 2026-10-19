import { usePagedItems } from "../../hooks/usePagedItems";
import type { PokemonSummary } from "../../types/pokemon";
import { PokemonCard } from "./PokemonCard";

export function PagedPokemonGrid({ results }: { results: PokemonSummary[] }) {
  const { visibleItems, sentinelRef } = usePagedItems(results);

  return (
    <>
      <ul
        aria-label="Pokémon"
        className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6"
      >
        {visibleItems.map((pokemon) => (
          <PokemonCard key={pokemon.id} pokemon={pokemon} />
        ))}
      </ul>
      <div ref={sentinelRef} aria-hidden />
    </>
  );
}
