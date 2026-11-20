import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { usePlaythroughContext } from "../../contexts/playthrough-context";
import { TEAM_SIZE } from "../../lib/team";
import { PRIMARY_BUTTON } from "../shared/button-styles";
import { MemberCard } from "./MemberCard";

export function CurrentTeam() {
  const { playthrough, team } = usePlaythroughContext();
  const full = team.length >= TEAM_SIZE;

  return (
    <section aria-labelledby="team-title" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="team-title" className="text-2xl font-bold">
          Team {team.length}/{TEAM_SIZE}
        </h2>
        {full ? (
          <p className="text-ink/70 font-medium">Swap someone out first.</p>
        ) : (
          <Link
            to="/playthroughs/$playthroughId/pick"
            params={{ playthroughId: playthrough.id }}
            className={PRIMARY_BUTTON}
          >
            <Plus className="size-6" aria-hidden />
            Add Pokémon
          </Link>
        )}
      </div>
      {team.length === 0 ? (
        <p className="border-ink rounded-2xl border-[3px] border-dashed bg-white/70 px-6 py-10 text-center text-lg font-medium">
          {playthrough.stints.length === 0
            ? "No team yet. Add your starter to begin the timeline."
            : "Everyone has left the team. Add a Pokémon to keep going."}
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {team.map((stint) => (
            <MemberCard key={stint.id} stint={stint} />
          ))}
        </ul>
      )}
    </section>
  );
}
