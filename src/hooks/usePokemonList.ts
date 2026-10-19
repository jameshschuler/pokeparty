import { useQuery } from "@tanstack/react-query";
import { fetchPokemonList } from "../lib/pokeapi";
import type { PokemonSummary } from "../types/pokemon";

export function usePokemonList() {
  return useQuery({ queryKey: ["pokemon-list"], queryFn: fetchPokemonList });
}

export function usePokemonSummary(id: number): PokemonSummary | undefined {
  const { data } = usePokemonList();
  return data?.find((pokemon) => pokemon.id === id);
}
