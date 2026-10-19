import { PokemonGrid } from "./PokemonGrid";
import { RegionFilter } from "./RegionFilter";
import { SearchBar } from "./SearchBar";
import { ShinyModeToggle } from "./ShinyModeToggle";
import { TeamTray } from "./TeamTray";
import { TypeFilter } from "./TypeFilter";

export function TeamBuilder() {
  return (
    <div className="-mt-4 flex flex-col gap-3">
      <h1 className="sr-only">Build your team</h1>
      <div className="bg-surface/95 sticky top-0 z-10 -mx-4 flex flex-col gap-2 px-4 pt-3 pb-2 backdrop-blur">
        <div className="flex gap-2">
          <div className="min-w-0 flex-1">
            <SearchBar />
          </div>
          <ShinyModeToggle />
        </div>
        <TypeFilter />
        <RegionFilter />
      </div>
      <PokemonGrid />
      <TeamTray />
    </div>
  );
}
