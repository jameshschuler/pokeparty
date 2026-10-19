import type { PokemonFilter, PokemonSummary } from "../types/pokemon";

const SPRITE_BASE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

export function isValidPokemonId(id: number): boolean {
  return Number.isSafeInteger(id) && id >= 1;
}

export function spriteUrl(id: number, shiny: boolean): string {
  return `${SPRITE_BASE_URL}${shiny ? "/shiny" : ""}/${id}.png`;
}

export function buildSearchText(name: string, label: string): string {
  return `${name.replaceAll("-", " ")} ${label}`.toLowerCase();
}

export function formatPokemonLabel(
  pokemon: Pick<PokemonSummary, "displayName" | "variant">,
): string {
  return pokemon.variant
    ? `${pokemon.displayName} (${pokemon.variant})`
    : pokemon.displayName;
}

export function formatMemberName(
  pokemon: PokemonSummary,
  shiny: boolean,
): string {
  return `${shiny ? "shiny " : ""}${formatPokemonLabel(pokemon)}`;
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
  return pokemon.searchText.includes(normalized.replaceAll("-", " "));
}

export function filterPokemon(
  pokemon: PokemonSummary[],
  filter: PokemonFilter,
): PokemonSummary[] {
  return pokemon.filter(
    (entry) =>
      matchesSearch(entry, filter.query) &&
      (!filter.typeIds || filter.typeIds.has(entry.id)) &&
      (!filter.region || entry.region === filter.region) &&
      (!filter.legendaryOnly || entry.legendary),
  );
}
