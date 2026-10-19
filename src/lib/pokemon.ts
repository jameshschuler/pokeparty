import type { PokemonSummary } from "../types/pokemon";

export const SPECIES_COUNT = 1025;

const SPRITE_BASE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

const REGION_ADJECTIVES = {
  alola: "Alolan",
  galar: "Galarian",
  hisui: "Hisuian",
  paldea: "Paldean",
} as const;

type Region = keyof typeof REGION_ADJECTIVES;

const REGIONAL_FORM_PATTERN = /^(.+)-(alola|galar|hisui|paldea)(?:-(.+))?$/;

const EXCLUDED_FORM_VARIANTS = ["cap", "zen"];

const DEFAULT_FORM_VARIANT = "standard";

export type RegionalForm = {
  baseName: string;
  region: Region;
  variant: string | undefined;
};

export function parseRegionalForm(name: string): RegionalForm | null {
  const match = name.match(REGIONAL_FORM_PATTERN);
  if (!match) {
    return null;
  }
  const [, baseName, region, variant] = match;
  if (variant && EXCLUDED_FORM_VARIANTS.includes(variant)) {
    return null;
  }
  return { baseName, region: region as Region, variant };
}

export function isValidPokemonId(id: number): boolean {
  return Number.isSafeInteger(id) && id >= 1;
}

export function spriteUrl(id: number, shiny: boolean): string {
  return `${SPRITE_BASE_URL}${shiny ? "/shiny" : ""}/${id}.png`;
}

function titleCase(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export type PokemonNameParts = {
  name: string;
  variant: string | null;
};

export function pokemonNameParts(name: string): PokemonNameParts {
  const form = parseRegionalForm(name);
  if (!form) {
    return { name: titleCase(name), variant: null };
  }
  return {
    name: `${REGION_ADJECTIVES[form.region]} ${titleCase(form.baseName)}`,
    variant:
      form.variant && form.variant !== DEFAULT_FORM_VARIANT
        ? titleCase(form.variant)
        : null,
  };
}

export function formatPokemonName(name: string): string {
  const parts = pokemonNameParts(name);
  return parts.variant ? `${parts.name} (${parts.variant})` : parts.name;
}

export function formatMemberName(name: string, shiny: boolean): string {
  return `${shiny ? "shiny " : ""}${formatPokemonName(name)}`;
}

export function formatPokemonNumber(speciesId: number): string {
  return `#${String(speciesId).padStart(4, "0")}`;
}

export function compareDexOrder(a: PokemonSummary, b: PokemonSummary): number {
  return a.speciesId - b.speciesId || a.id - b.id;
}

export function matchesSearch(pokemon: PokemonSummary, query: string): boolean {
  const normalized = query.trim().toLowerCase().replace(/^#/, "");
  if (!normalized) {
    return true;
  }
  if (/^\d+$/.test(normalized)) {
    return (
      formatPokemonNumber(pokemon.speciesId).slice(1).startsWith(normalized) ||
      String(pokemon.speciesId).startsWith(String(Number(normalized)))
    );
  }
  const searchable = `${pokemon.name.replaceAll("-", " ")} ${formatPokemonName(pokemon.name).toLowerCase()}`;
  return searchable.includes(normalized.replaceAll("-", " "));
}

export function filterPokemon(
  pokemon: PokemonSummary[],
  query: string,
  typeIds: Set<number> | undefined,
): PokemonSummary[] {
  return pokemon.filter(
    (entry) =>
      matchesSearch(entry, query) && (!typeIds || typeIds.has(entry.id)),
  );
}
