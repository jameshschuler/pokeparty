import type { PokemonSummary, PokemonType } from "../types/pokemon";
import { compareDexOrder, parseRegionalForm, SPECIES_COUNT } from "./pokemon";

const API_URL = "https://pokeapi.co/api/v2";

const FORM_PAGE_SIZE = 1000;

type NamedResource = { name: string; url: string };

type NamedResourceList = { results: NamedResource[] };

export function idFromUrl(url: string): number {
  const match = url.match(/\/(\d+)\/?$/);
  if (!match) {
    throw new Error(`No id found in ${url}`);
  }
  return Number(match[1]);
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok) {
    throw new Error(`PokeAPI request failed (${response.status}): ${path}`);
  }
  return (await response.json()) as T;
}

export async function fetchPokemonList(): Promise<PokemonSummary[]> {
  const [species, forms] = await Promise.all([
    getJson<NamedResourceList>(`/pokemon-species?limit=${SPECIES_COUNT}`),
    getJson<NamedResourceList>(
      `/pokemon?offset=${SPECIES_COUNT}&limit=${FORM_PAGE_SIZE}`,
    ),
  ]);
  const speciesIds = new Map(
    species.results.map((entry) => [entry.name, idFromUrl(entry.url)]),
  );
  const baseSpecies = species.results.map((entry) => {
    const id = idFromUrl(entry.url);
    return { id, speciesId: id, name: entry.name };
  });
  const regionalForms = forms.results.flatMap((entry) => {
    const speciesId = speciesIds.get(
      parseRegionalForm(entry.name)?.baseName ?? "",
    );
    return speciesId
      ? [{ id: idFromUrl(entry.url), speciesId, name: entry.name }]
      : [];
  });
  return [...baseSpecies, ...regionalForms].sort(compareDexOrder);
}

export async function fetchPokemonIdsByType(
  type: PokemonType,
): Promise<number[]> {
  const body = await getJson<{ pokemon: { pokemon: NamedResource }[] }>(
    `/type/${type}`,
  );
  return body.pokemon.map((entry) => idFromUrl(entry.pokemon.url));
}
