import { useNatureDexContext } from "../../contexts/nature-dex-context";
import { PILL_BUTTON } from "../shared/button-styles";
import { NatureDexRow } from "./NatureDexRow";
import { PANEL } from "./nature-dex-styles";

export function NatureDexList() {
  const { entries, clearFilters } = useNatureDexContext();

  if (entries.length === 0) {
    return (
      <div className="border-ink flex flex-col items-center gap-3 rounded-2xl border-[3px] border-dashed bg-white/70 px-6 py-10 text-center">
        <p className="text-lg font-medium">No Pokémon match these filters.</p>
        <button type="button" onClick={clearFilters} className={PILL_BUTTON}>
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <ul aria-label="Pokémon" className={`${PANEL} divide-ink/15 divide-y-2`}>
      {entries.map((entry) => (
        <li key={entry.dexNumber}>
          <NatureDexRow entry={entry} />
        </li>
      ))}
    </ul>
  );
}
