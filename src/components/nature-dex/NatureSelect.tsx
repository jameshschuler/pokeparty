import { useNatureDexContext } from "../../contexts/nature-dex-context";
import {
  NATURES,
  PICKABLE_NATURES,
  STAT_LABELS,
  type Nature,
} from "../../lib/natures";

export function NatureSelect() {
  const { filters, updateFilters } = useNatureDexContext();

  return (
    <select
      aria-label="Filter by nature"
      value={filters.nature ?? ""}
      onChange={(event) =>
        updateFilters({
          nature: (event.target.value || undefined) as Nature | undefined,
        })
      }
      className="border-ink min-h-9 min-w-0 rounded-full border-2 bg-white px-3 text-sm font-semibold"
    >
      <option value="">Any nature</option>
      {PICKABLE_NATURES.map((nature) => {
        const [up, down] = NATURES[nature];

        return (
          <option key={nature} value={nature}>
            {nature} (+{STAT_LABELS[up]} −{STAT_LABELS[down]})
          </option>
        );
      })}
    </select>
  );
}
