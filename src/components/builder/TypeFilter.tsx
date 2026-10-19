import { useTeamBuilderContext } from "../../contexts/team-builder-context";
import { POKEMON_TYPES } from "../../types/pokemon";
import { TYPE_STYLES } from "../pokemon/pokemon-type-styles";
import { ChipList } from "./ChipList";
import { ChipRow } from "./ChipRow";
import { FilterChip } from "./FilterChip";

export function TypeFilter() {
  const { type, setType } = useTeamBuilderContext();

  return (
    <ChipRow>
      <ChipList label="Filter by type">
        {POKEMON_TYPES.map((option) => (
          <li key={option}>
            <FilterChip
              selected={option === type}
              selectedClassName={TYPE_STYLES[option]}
              onClick={() => setType(option === type ? null : option)}
            >
              {option}
            </FilterChip>
          </li>
        ))}
      </ChipList>
    </ChipRow>
  );
}
