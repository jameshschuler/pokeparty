import { PokemonGrid } from "./PokemonGrid";
import { SearchBar } from "./SearchBar";
import { TeamTray } from "./TeamTray";
import { TypeFilter } from "./TypeFilter";

export function TeamBuilder() {
  return (
    <div className="-mt-4 flex flex-col gap-3">
      <h1 className="sr-only">Build your team</h1>
      <div className="bg-surface/95 sticky top-0 z-10 -mx-4 flex flex-col gap-2 px-4 pt-3 pb-2 backdrop-blur">
        <SearchBar />
        <TypeFilter />
      </div>
      <PokemonGrid />
      <TeamTray />
    </div>
  );
}
