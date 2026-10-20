import type { Team, TeamMember } from "../types/team";

export const TEAM_SIZE = 6;

export const NEW_TEAM_ID = "new";

export function hasPokemon(members: TeamMember[], pokemonId: number): boolean {
  return members.some((member) => member.pokemonId === pokemonId);
}

export function isTeamFull(members: TeamMember[]): boolean {
  return members.length >= TEAM_SIZE;
}

export function addPokemon(
  members: TeamMember[],
  pokemonId: number,
  shiny: boolean,
): TeamMember[] {
  if (hasPokemon(members, pokemonId) || isTeamFull(members)) {
    return members;
  }

  return [...members, { pokemonId, shiny }];
}

export function removePokemon(
  members: TeamMember[],
  pokemonId: number,
): TeamMember[] {
  return members.filter((member) => member.pokemonId !== pokemonId);
}

export function toggleShiny(
  members: TeamMember[],
  pokemonId: number,
): TeamMember[] {
  return members.map((member) =>
    member.pokemonId === pokemonId
      ? { ...member, shiny: !member.shiny }
      : member,
  );
}

export function createTeam(members: TeamMember[], now: number): Team {
  return { id: crypto.randomUUID(), members, createdAt: now, updatedAt: now };
}
