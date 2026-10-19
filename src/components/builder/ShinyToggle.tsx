import { Sparkles } from "lucide-react";
import { useTeamBuilderContext } from "../../contexts/team-builder-context";
import type { TeamMember } from "../../types/team";

type ShinyToggleProps = {
  member: TeamMember;
  name: string;
};

export function ShinyToggle({ member, name }: ShinyToggleProps) {
  const { toggleShinyPokemon } = useTeamBuilderContext();

  return (
    <button
      type="button"
      onClick={() => toggleShinyPokemon(member.pokemonId)}
      aria-pressed={member.shiny}
      aria-label={`Shiny ${name}`}
      className={`border-ink absolute top-1.5 right-1.5 flex size-8 items-center justify-center rounded-full border-2 transition active:scale-90 ${
        member.shiny ? "bg-primary text-white" : "text-ink bg-white"
      }`}
    >
      <Sparkles className="size-4" strokeWidth={2.5} aria-hidden />
    </button>
  );
}
