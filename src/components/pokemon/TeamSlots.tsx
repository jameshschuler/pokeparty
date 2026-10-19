import { TEAM_SIZE } from "../../lib/team";
import { PokemonSprite } from "./PokemonSprite";

export function TeamSlots({ pokemonIds }: { pokemonIds: number[] }) {
  return (
    <ul className="grid grid-cols-6 gap-1.5">
      {Array.from({ length: TEAM_SIZE }, (_, index) => {
        const id = pokemonIds[index];
        return (
          <li
            key={id ?? `empty-${index}`}
            className="border-ink aspect-square rounded-full border-2 bg-white p-0.5"
          >
            {id !== undefined && <PokemonSprite id={id} alt="" />}
          </li>
        );
      })}
    </ul>
  );
}
