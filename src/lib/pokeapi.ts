import type { PokemonType } from "../types/pokemon";
import { idFromUrl } from "./resource-id";

const API_URL = "https://pokeapi.co/api/v2";

type NamedResource = { name: string; url: string };

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);

  if (!response.ok) {
    throw new Error(`PokeAPI request failed (${response.status}): ${path}`);
  }

  return (await response.json()) as T;
}

export async function fetchPokemonIdsByType(
  type: PokemonType,
): Promise<number[]> {
  const body = await getJson<{ pokemon: { pokemon: NamedResource }[] }>(
    `/type/${type}`,
  );

  return body.pokemon.map((entry) => idFromUrl(entry.pokemon.url));
}
