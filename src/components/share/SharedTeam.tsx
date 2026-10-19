import { Link, useNavigate } from "@tanstack/react-router";
import { Shuffle } from "lucide-react";
import { useTeamsContext } from "../../contexts/teams-context";
import { resolveSharedTeam } from "../../lib/share";
import type { TeamMember } from "../../types/team";
import { SharedPokemon } from "./SharedPokemon";

export function SharedTeam({ members }: { members: TeamMember[] }) {
  const { createTeam } = useTeamsContext();
  const navigate = useNavigate();
  const team = resolveSharedTeam(members);

  function handleRemix() {
    const created = createTeam(team);
    navigate({ to: "/team/$teamId", params: { teamId: created.id } });
  }

  if (team.length === 0) {
    return (
      <section className="flex flex-col items-center gap-4 py-12 text-center">
        <h1 className="text-2xl font-bold">This link doesn't have a team</h1>
        <Link to="/" className="font-semibold underline underline-offset-4">
          Go to my teams
        </Link>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-5">
      <h1 className="text-3xl font-bold">Check out this party!</h1>
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {team.map((member) => (
          <SharedPokemon key={member.pokemonId} member={member} />
        ))}
      </ul>
      <button
        type="button"
        onClick={handleRemix}
        className="border-ink bg-primary shadow-sticker flex min-h-12 items-center justify-center gap-2 self-center rounded-2xl border-[3px] px-6 text-lg font-semibold text-white transition active:translate-x-1 active:translate-y-1 active:shadow-none"
      >
        <Shuffle className="size-5" aria-hidden />
        Remix this team
      </button>
    </section>
  );
}
