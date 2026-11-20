import { createFileRoute } from "@tanstack/react-router";
import { PickPokemon } from "../components/playthroughs/PickPokemon";
import { usePlaythroughContext } from "../contexts/playthrough-context";
import { PokemonPickerProvider } from "../contexts/pokemon-picker-context";
import { gamePokemon } from "../lib/game-dex";
import { findGame } from "../lib/games";
import { parsePickSearch } from "../lib/playthrough-search";

export const Route = createFileRoute("/playthroughs/$playthroughId/pick")({
  validateSearch: parsePickSearch,
  component: PickRoute,
});

function PickRoute() {
  const { swap } = Route.useSearch();
  const { playthrough } = usePlaythroughContext();
  const gameLimit = {
    gameName: findGame(playthrough.gameId).name,
    pokemon: gamePokemon(playthrough.gameId),
  };

  return (
    <PokemonPickerProvider gameLimit={gameLimit}>
      <PickPokemon swapId={swap ?? null} />
    </PokemonPickerProvider>
  );
}
