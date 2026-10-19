import type { PokemonSummary } from "../types/pokemon";
import { isValidPokemonId } from "./pokemon";
import { TEAM_SIZE } from "./team";

export function teamShareUrl(pokemonIds: number[], origin: string): string {
  return `${origin}/share?team=${pokemonIds.join(",")}`;
}

export function parseSharedTeam(param: string): number[] {
  return [...new Set(param.split(",").map(Number).filter(isValidPokemonId))];
}

export function resolveSharedTeam(
  pokemonIds: number[],
  pokedex: PokemonSummary[],
): PokemonSummary[] {
  return pokemonIds
    .flatMap((id) => pokedex.find((pokemon) => pokemon.id === id) ?? [])
    .slice(0, TEAM_SIZE);
}
