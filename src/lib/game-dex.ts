import gameDexData from "../data/game-dex.json";
import type { PokemonSummary } from "../types/pokemon";
import { gameGeneration, type GameId } from "./games";
import { POKEDEX } from "./pokedex";
import { regionGeneration } from "./regions";

const GAME_DEX = gameDexData as Record<GameId, number[]>;

const FORMS_BY_SPECIES = new Map<number, PokemonSummary[]>();
for (const pokemon of POKEDEX) {
  FORMS_BY_SPECIES.set(pokemon.speciesId, [
    ...(FORMS_BY_SPECIES.get(pokemon.speciesId) ?? []),
    pokemon,
  ]);
}

const GAME_POKEMON = new Map<GameId, PokemonSummary[]>();

export function gamePokemon(gameId: GameId): PokemonSummary[] {
  const cached = GAME_POKEMON.get(gameId);

  if (cached) {
    return cached;
  }
  const generation = gameGeneration(gameId);
  const pokemon = GAME_DEX[gameId].flatMap((speciesId) =>
    (FORMS_BY_SPECIES.get(speciesId) ?? []).filter(
      (form) => regionGeneration(form.region) <= generation,
    ),
  );
  GAME_POKEMON.set(gameId, pokemon);

  return pokemon;
}
