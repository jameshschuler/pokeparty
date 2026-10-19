import { useTeamBuilderContext } from "../../contexts/team-builder-context";
import { POKEMON_TYPES } from "../../types/pokemon";
import { TYPE_STYLES } from "../pokemon/pokemon-type-styles";

export function TypeFilter() {
  const { type, setType } = useTeamBuilderContext();

  return (
    <div className="-mx-4 [scrollbar-width:none] overflow-x-auto px-4 pb-1">
      <ul className="flex w-max gap-2 py-1" aria-label="Filter by type">
        {POKEMON_TYPES.map((option) => {
          const selected = option === type;
          return (
            <li key={option}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => setType(selected ? null : option)}
                className={`border-ink min-h-9 rounded-full border-2 px-3 text-sm font-semibold capitalize transition ${
                  selected
                    ? `${TYPE_STYLES[option]} shadow-sticker-sm`
                    : "bg-white"
                }`}
              >
                {option}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
