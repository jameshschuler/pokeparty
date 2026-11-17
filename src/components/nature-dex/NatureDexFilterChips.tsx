import { useNatureDexContext } from "../../contexts/nature-dex-context";
import { ROLE_LABELS, ROLES } from "../../lib/natures";
import { HNS_REGIONS } from "../../lib/nature-dex-filters";
import { REGION_LABELS } from "../../lib/regions";
import { ChipList } from "../shared/ChipList";
import { ChipRow } from "../shared/ChipRow";
import { FilterChip } from "../shared/FilterChip";

export function NatureDexFilterChips() {
  const { filters, updateFilters } = useNatureDexContext();

  return (
    <ChipRow>
      <ChipList label="Filter by region">
        {HNS_REGIONS.map((region) => (
          <li key={region}>
            <FilterChip
              selected={region === filters.region}
              selectedClassName="bg-primary text-white"
              onClick={() =>
                updateFilters({
                  region: region === filters.region ? undefined : region,
                })
              }
            >
              {REGION_LABELS[region]}
            </FilterChip>
          </li>
        ))}
      </ChipList>
      <ChipList label="Filter by role">
        {ROLES.map((role) => (
          <li key={role}>
            <FilterChip
              selected={role === filters.role}
              selectedClassName="bg-accent"
              onClick={() =>
                updateFilters({
                  role: role === filters.role ? undefined : role,
                })
              }
            >
              {ROLE_LABELS[role]}
            </FilterChip>
          </li>
        ))}
      </ChipList>
    </ChipRow>
  );
}
