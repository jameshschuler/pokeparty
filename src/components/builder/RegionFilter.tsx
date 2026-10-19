import { Crown } from "lucide-react";
import { useTeamBuilderContext } from "../../contexts/team-builder-context";
import { REGIONS } from "../../types/pokemon";
import { ChipList } from "./ChipList";
import { ChipRow } from "./ChipRow";
import { FilterChip } from "./FilterChip";

export function RegionFilter() {
  const { region, setRegion, legendaryOnly, setLegendaryOnly } =
    useTeamBuilderContext();

  return (
    <ChipRow>
      <ChipList label="Filter by rarity">
        <li>
          <FilterChip
            selected={legendaryOnly}
            selectedClassName="bg-accent"
            onClick={() => setLegendaryOnly(!legendaryOnly)}
          >
            <Crown className="size-4" aria-hidden />
            Legendary
          </FilterChip>
        </li>
      </ChipList>
      <ChipList label="Filter by region">
        {REGIONS.map((option) => (
          <li key={option}>
            <FilterChip
              selected={option === region}
              selectedClassName="bg-primary text-white"
              onClick={() => setRegion(option === region ? null : option)}
            >
              {option}
            </FilterChip>
          </li>
        ))}
      </ChipList>
    </ChipRow>
  );
}
