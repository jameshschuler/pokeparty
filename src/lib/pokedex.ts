import pokedexData from "../data/pokedex.json";
import type { PokemonSummary, Region } from "../types/pokemon";
import { QUIZ_MODE_RULES, type QuizMode } from "./quiz";
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
    evolvesFrom: number | null;
  }[];
  forms: {
    id: number;
    speciesId: number;
    name: string;
    displayName: string;
    variant: string | null;
    region: Region;
    regional: boolean;
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
  const species = data.species.map(
    ({ id, name, displayName, region, legendary }) => ({
      id,
      name,
      displayName,
      region,
      legendary,
      speciesId: id,
      variant: null,
      regional: false,
    }),
  );
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

const SPECIES_WITH_REGIONAL_FORMS = POKEDEX.filter(
  (pokemon) => pokemon.id === pokemon.speciesId || pokemon.regional,
);

export function quizPool(mode: QuizMode): PokemonSummary[] {
  return QUIZ_MODE_RULES[mode].usesRegionalForms
    ? SPECIES_WITH_REGIONAL_FORMS
    : SPECIES;
}

export type EvolutionLink = {
  from: PokemonSummary;
  to: PokemonSummary;
};

export function buildEvolutionFamilies(
  data: PokedexData,
  pokedex: PokemonSummary[],
): EvolutionLink[][] {
  const byId = new Map(pokedex.map((pokemon) => [pokemon.id, pokemon]));
  const evolvesFrom = new Map(
    data.species.map((entry) => [entry.id, entry.evolvesFrom]),
  );
  const families = new Map<number, EvolutionLink[]>();

  function familyOf(id: number): number {
    const parent = evolvesFrom.get(id);

    return parent ? familyOf(parent) : id;
  }

  function evolvingForm(from: PokemonSummary, to: PokemonSummary) {
    const regional = pokedex.find(
      (pokemon) =>
        pokemon.regional &&
        pokemon.speciesId === from.id &&
        pokemon.region === to.region,
    );

    return regional && from.region !== to.region ? regional : from;
  }

  for (const entry of data.species) {
    const from = entry.evolvesFrom ? byId.get(entry.evolvesFrom) : undefined;
    const to = byId.get(entry.id);

    if (from && to) {
      const family = familyOf(entry.id);
      const link = { from: evolvingForm(from, to), to };
      families.set(family, [...(families.get(family) ?? []), link]);
    }
  }

  return [...families.values()];
}

export const EVOLUTION_FAMILIES = buildEvolutionFamilies(
  pokedexData as PokedexData,
  POKEDEX,
);
