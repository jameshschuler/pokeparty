import { usePokemonPickerContext } from "../../contexts/pokemon-picker-context";
import { formatPokemonType } from "../../lib/pokemon";
import { POKEMON_TYPES } from "../../types/pokemon";

export function TypeFilter() {
  const { type, setType } = usePokemonPickerContext();

  return (
    <ul
      aria-label="Filter by type"
      className="grid grid-cols-9 gap-1.5 py-1 sm:flex sm:flex-wrap sm:gap-2"
    >
      {POKEMON_TYPES.map((option) => (
        <li key={option} className="flex justify-center">
          <button
            type="button"
            aria-pressed={option === type}
            aria-label={formatPokemonType(option)}
            title={formatPokemonType(option)}
            onClick={() => setType(option === type ? null : option)}
            className={`flex aspect-square w-full max-w-10 items-center justify-center rounded-full border-2 p-0.5 transition active:scale-90 sm:size-10 ${
              option === type
                ? "border-ink shadow-sticker-sm bg-white"
                : `border-transparent ${type ? "opacity-50" : ""}`
            }`}
          >
            <img
              src={`/types/${option}.svg`}
              alt=""
              width={256}
              height={256}
              className="size-full"
            />
          </button>
        </li>
      ))}
    </ul>
  );
}
