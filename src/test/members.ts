import type { TeamMember } from "../types/team";

export function regularMembers(...pokemonIds: number[]): TeamMember[] {
  return pokemonIds.map((pokemonId) => ({ pokemonId, shiny: false }));
}
