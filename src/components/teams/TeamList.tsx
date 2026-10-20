import { useTeamsContext } from "../../contexts/teams-context";
import { BallIcon } from "../layout/BallIcon";
import { NewTeamButton } from "./NewTeamButton";
import { TeamListItem } from "./TeamListItem";

export function TeamList() {
  const { teams } = useTeamsContext();
  const sortedTeams = teams.toSorted((a, b) => b.updatedAt - a.updatedAt);

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">My teams</h1>
        <NewTeamButton />
      </div>
      {sortedTeams.length === 0 ? (
        <div className="border-ink flex flex-col items-center gap-3 rounded-2xl border-[3px] border-dashed bg-white/70 px-6 py-12 text-center">
          <BallIcon className="size-16 motion-safe:animate-bounce" />
          <p className="text-xl font-semibold">No teams yet</p>
          <p>Tap "New team" and pick up to 6 Pokémon.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {sortedTeams.map((team) => (
            <TeamListItem key={team.id} team={team} />
          ))}
        </ul>
      )}
    </section>
  );
}
