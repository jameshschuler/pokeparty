import { useQuery } from "@tanstack/react-query";
import { fetchPokemonIdsByType } from "../lib/pokeapi";
import type { PokemonType } from "../types/pokemon";

function toIdSet(ids: number[]): Set<number> {
  return new Set(ids);
}

export function usePokemonIdsByType(type: PokemonType | null) {
  return useQuery({
    queryKey: ["type", type],
    queryFn: () => fetchPokemonIdsByType(type!),
    enabled: type !== null,
    select: toIdSet,
  });
}
