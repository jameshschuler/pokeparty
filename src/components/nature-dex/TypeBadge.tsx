import type { PokemonType } from "../../types/pokemon";
import { TYPE_STYLES } from "../pokemon/pokemon-type-styles";

export function TypeBadge({ type }: { type: PokemonType }) {
  return (
    <span
      className={`rounded-full px-2 text-xs font-bold whitespace-nowrap capitalize ${TYPE_STYLES[type]}`}
    >
      {type}
    </span>
  );
}
