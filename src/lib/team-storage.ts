import type { Team, TeamMember } from "../types/team";
import { isValidPokemonId } from "./pokemon";
import { TEAM_SIZE } from "./team";

export const TEAMS_STORAGE_KEY = "pokeparty:teams";

function isTeamMember(value: unknown): value is TeamMember {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const member = value as Record<string, unknown>;
  return (
    typeof member.pokemonId === "number" &&
    isValidPokemonId(member.pokemonId) &&
    typeof member.shiny === "boolean"
  );
}

function readMembers(team: Record<string, unknown>): unknown[] | null {
  if (Array.isArray(team.members)) {
    return team.members;
  }
  if (Array.isArray(team.pokemonIds)) {
    return team.pokemonIds.map((pokemonId) => ({ pokemonId, shiny: false }));
  }
  return null;
}

function parseStoredTeam(value: unknown): Team | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const team = value as Record<string, unknown>;
  const members = readMembers(team);
  if (
    typeof team.id !== "string" ||
    typeof team.createdAt !== "number" ||
    typeof team.updatedAt !== "number" ||
    !members ||
    members.length > TEAM_SIZE ||
    !members.every(isTeamMember)
  ) {
    return null;
  }
  return {
    id: team.id,
    members,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
  };
}

export function loadTeams(): Team[] {
  try {
    const raw = localStorage.getItem(TEAMS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.flatMap((entry) => parseStoredTeam(entry) ?? [])
      : [];
  } catch {
    return [];
  }
}

export function saveTeams(teams: Team[]): void {
  localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
}
