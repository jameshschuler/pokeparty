export const POKEMON_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

export type PokemonType = (typeof POKEMON_TYPES)[number];

export const REGIONS = [
  "kanto",
  "johto",
  "hoenn",
  "sinnoh",
  "unova",
  "kalos",
  "alola",
  "galar",
  "hisui",
  "paldea",
] as const;

export type Region = (typeof REGIONS)[number];

export type PokemonSummary = {
  id: number;
  speciesId: number;
  name: string;
  displayName: string;
  variant: string | null;
  region: Region;
  legendary: boolean;
  regional: boolean;
  searchText: string;
};

export type PokemonFilter = {
  query: string;
  typeIds: Set<number> | undefined;
  region: Region | null;
  legendaryOnly: boolean;
};
