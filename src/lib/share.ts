import type { PokemonSummary } from "../types/pokemon";
import type { TeamMember } from "../types/team";
import { isValidPokemonId } from "./pokemon";
import { TEAM_SIZE } from "./team";

const SHINY_SUFFIX = "s";

const SHARED_MEMBER_PATTERN = /^(\d+)(s?)$/;

export function teamShareUrl(members: TeamMember[], origin: string): string {
  const team = members
    .map((member) => `${member.pokemonId}${member.shiny ? SHINY_SUFFIX : ""}`)
    .join(",");
  return `${origin}/share?team=${team}`;
}

export function parseSharedTeam(param: string): TeamMember[] {
  const seen = new Set<number>();
  const members: TeamMember[] = [];
  for (const token of param.split(",")) {
    const match = token.trim().match(SHARED_MEMBER_PATTERN);
    const pokemonId = Number(match?.[1]);
    if (!match || !isValidPokemonId(pokemonId) || seen.has(pokemonId)) {
      continue;
    }
    seen.add(pokemonId);
    members.push({ pokemonId, shiny: match[2] === SHINY_SUFFIX });
  }
  return members;
}

export function resolveSharedTeam(
  members: TeamMember[],
  pokedex: PokemonSummary[],
): TeamMember[] {
  const knownIds = new Set(pokedex.map((pokemon) => pokemon.id));
  return members
    .filter((member) => knownIds.has(member.pokemonId))
    .slice(0, TEAM_SIZE);
}
