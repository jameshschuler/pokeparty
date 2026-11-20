import { usePlaythroughContext } from "../../contexts/playthrough-context";
import { findGame } from "../../lib/games";
import { playthroughTitle } from "../../lib/playthrough";
import { BackLink } from "../layout/BackLink";
import { CurrentTeam } from "./CurrentTeam";
import { Timeline } from "./Timeline";

export function PlaythroughView() {
  const { playthrough, steps } = usePlaythroughContext();
  const gameName = findGame(playthrough.gameId).name;

  return (
    <section className="flex flex-col gap-5">
      <BackLink to="/playthroughs" label="Playthroughs" />
      <div className="min-w-0">
        <h1 className="truncate text-3xl font-bold">
          {playthroughTitle(playthrough)}
        </h1>
        {playthrough.name && <p className="text-ink/70">{gameName}</p>}
      </div>
      <CurrentTeam />
      {steps.length > 0 && <Timeline />}
    </section>
  );
}
