import type { PokemonSummary } from "../types/pokemon";
import { EVOLUTION_FAMILIES, findPokemon, POKEDEX } from "./pokedex";
import { regionGeneration } from "./regions";

const EVOLUTION_LINKS = EVOLUTION_FAMILIES.flat();

function regionalForms(speciesId: number): PokemonSummary[] {
  return POKEDEX.filter(
    (pokemon) => pokemon.regional && pokemon.speciesId === speciesId,
  );
}

function targetsOf(pokemonId: number): PokemonSummary[] {
  return EVOLUTION_LINKS.filter((link) => link.from.id === pokemonId).map(
    (link) => link.to,
  );
}

function sameRegionForm(
  speciesId: number,
  region: PokemonSummary["region"],
): PokemonSummary | undefined {
  return regionalForms(speciesId).find((form) => form.region === region);
}

export function nextEvolutions(pokemonId: number): PokemonSummary[] {
  const pokemon = findPokemon(pokemonId);

  if (!pokemon) {
    return [];
  }

  if (pokemon.regional) {
    const direct = targetsOf(pokemon.id);

    return direct.length > 0
      ? direct
      : targetsOf(pokemon.speciesId).flatMap(
          (target) => sameRegionForm(target.id, pokemon.region) ?? [],
        );
  }
  const ownRegions = new Set(
    regionalForms(pokemon.speciesId).map((form) => form.region),
  );

  return targetsOf(pokemon.id).flatMap((target) => [
    target,
    ...regionalForms(target.id).filter((form) => !ownRegions.has(form.region)),
  ]);
}

export function evolutionOptions(
  pokemonId: number,
  generation: number,
): PokemonSummary[] {
  return nextEvolutions(pokemonId).filter(
    (evolution) => regionGeneration(evolution.region) <= generation,
  );
}
