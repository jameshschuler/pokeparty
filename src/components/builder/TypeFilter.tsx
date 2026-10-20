import { useTeamBuilderContext } from "../../contexts/team-builder-context";
import { POKEMON_TYPES } from "../../types/pokemon";
import { TYPE_STYLES } from "../pokemon/pokemon-type-styles";
import { ChipList } from "../shared/ChipList";
import { ChipRow } from "../shared/ChipRow";
import { FilterChip } from "../shared/FilterChip";

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
              <span className="capitalize">{option}</span>
            </FilterChip>
          </li>
        ))}
      </ChipList>
    </ChipRow>
  );
}
