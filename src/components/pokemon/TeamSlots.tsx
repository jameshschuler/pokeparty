import { TEAM_SIZE } from "../../lib/team";
import type { TeamMember } from "../../types/team";
import { PokemonSprite } from "./PokemonSprite";
import { ShinyBadge } from "./ShinyBadge";

export function TeamSlots({ members }: { members: TeamMember[] }) {
  return (
    <ul className="grid grid-cols-6 gap-1.5">
      {Array.from({ length: TEAM_SIZE }, (_, index) => {
        const member = members[index];
        return (
          <li
            key={member?.pokemonId ?? `empty-${index}`}
            className="border-ink relative aspect-square rounded-full border-2 bg-white p-0.5"
          >
            {member && (
              <>
                <PokemonSprite
                  id={member.pokemonId}
                  shiny={member.shiny}
                  alt=""
                />
                {member.shiny && (
                  <ShinyBadge className="-right-1 -bottom-1 size-4" />
                )}
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}
