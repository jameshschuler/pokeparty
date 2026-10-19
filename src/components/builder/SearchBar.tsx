import { Search, X } from "lucide-react";
import { useTeamBuilderContext } from "../../contexts/team-builder-context";

export function SearchBar() {
  const { query, setQuery } = useTeamBuilderContext();

  return (
    <label className="border-ink shadow-sticker-sm focus-within:ring-accent flex min-h-12 items-center gap-2 rounded-2xl border-[3px] bg-white px-3 focus-within:ring-4">
      <Search className="size-5 shrink-0" aria-hidden />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by name or #"
        aria-label="Search Pokémon"
        className="placeholder:text-ink/50 w-full bg-transparent text-lg outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          aria-label="Clear search"
          className="flex size-8 shrink-0 items-center justify-center rounded-full"
        >
          <X className="size-5" aria-hidden />
        </button>
      )}
    </label>
  );
}
