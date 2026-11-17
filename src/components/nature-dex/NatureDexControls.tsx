import { useNatureDexContext } from "../../contexts/nature-dex-context";
import { NatureDexFilterChips } from "./NatureDexFilterChips";
import { NatureDexSearch } from "./NatureDexSearch";
import { NatureDexSettings } from "./NatureDexSettings";
import { NatureSelect } from "./NatureSelect";

export function NatureDexControls() {
  const { entries, total } = useNatureDexContext();

  return (
    <div className="bg-surface/95 sticky top-0 z-10 -mx-4 flex flex-col gap-2 px-4 pt-3 pb-2 backdrop-blur">
      <div className="flex gap-2">
        <div className="min-w-0 flex-1">
          <NatureDexSearch />
        </div>
        <NatureDexSettings />
      </div>
      <NatureDexFilterChips />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <NatureSelect />
        <span className="text-ink/70 text-sm tabular-nums" aria-live="polite">
          {entries.length} of {total} shown
        </span>
      </div>
    </div>
  );
}
