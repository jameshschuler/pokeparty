import type { Team } from "../types/team";
import { isValidPokemonId } from "./pokemon";
import { TEAM_SIZE } from "./team";

export const TEAMS_STORAGE_KEY = "pokeparty:teams";

function isTeam(value: unknown): value is Team {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const team = value as Record<string, unknown>;
  return (
    typeof team.id === "string" &&
    typeof team.createdAt === "number" &&
    typeof team.updatedAt === "number" &&
    Array.isArray(team.pokemonIds) &&
    team.pokemonIds.length <= TEAM_SIZE &&
    team.pokemonIds.every(isValidPokemonId)
  );
}

export function loadTeams(): Team[] {
  try {
    const raw = localStorage.getItem(TEAMS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isTeam) : [];
  } catch {
    return [];
  }
}

export function saveTeams(teams: Team[]): void {
  localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
}
