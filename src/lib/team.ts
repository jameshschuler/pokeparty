import type { Team } from "../types/team";

export const TEAM_SIZE = 6;

export function isTeamFull(pokemonIds: number[]): boolean {
  return pokemonIds.length >= TEAM_SIZE;
}

export function addPokemon(pokemonIds: number[], pokemonId: number): number[] {
  if (pokemonIds.includes(pokemonId) || isTeamFull(pokemonIds)) {
    return pokemonIds;
  }
  return [...pokemonIds, pokemonId];
}

export function removePokemon(
  pokemonIds: number[],
  pokemonId: number,
): number[] {
  return pokemonIds.filter((id) => id !== pokemonId);
}

export function createTeam(pokemonIds: number[], now: number): Team {
  return {
    id: crypto.randomUUID(),
    pokemonIds,
    createdAt: now,
    updatedAt: now,
  };
}

export const NEW_TEAM_ID = "new";
