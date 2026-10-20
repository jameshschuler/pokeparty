import pokedexData from "../data/pokedex.json";
import type { PokemonSummary, Region } from "../types/pokemon";
import {
  buildSearchText,
  compareDexOrder,
  formatPokemonLabel,
} from "./pokemon";

export type PokedexData = {
  species: {
    id: number;
    name: string;
    displayName: string;
    region: Region;
    legendary: boolean;
  }[];
  forms: {
    id: number;
    speciesId: number;
    name: string;
    displayName: string;
    variant: string | null;
    region: Region;
  }[];
};

type PokemonEntry = Omit<PokemonSummary, "searchText">;

function withSearchText(entry: PokemonEntry): PokemonSummary {
  return {
    ...entry,
    searchText: buildSearchText(entry.name, formatPokemonLabel(entry)),
  };
}

export function buildPokedex(data: PokedexData): PokemonSummary[] {
  const legendarySpecies = new Set(
    data.species.filter((entry) => entry.legendary).map((entry) => entry.id),
  );
  const species = data.species.map((entry) => ({
    ...entry,
    speciesId: entry.id,
    variant: null,
  }));
  const forms = data.forms.map((form) => ({
    ...form,
    legendary: legendarySpecies.has(form.speciesId),
  }));

  return [...species, ...forms].map(withSearchText).sort(compareDexOrder);
}

export const POKEDEX = buildPokedex(pokedexData as PokedexData);

const POKEDEX_BY_ID = new Map(POKEDEX.map((pokemon) => [pokemon.id, pokemon]));

export function findPokemon(id: number): PokemonSummary | undefined {
  return POKEDEX_BY_ID.get(id);
}

export const SPECIES = POKEDEX.filter(
  (pokemon) => pokemon.id === pokemon.speciesId,
);
