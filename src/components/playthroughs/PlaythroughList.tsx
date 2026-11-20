import { usePlaythroughsContext } from "../../contexts/playthroughs-context";
import { BallIcon } from "../layout/BallIcon";
import { NewPlaythroughButton } from "./NewPlaythroughButton";
import { PlaythroughListItem } from "./PlaythroughListItem";

export function PlaythroughList() {
  const { playthroughs } = usePlaythroughsContext();
  const sorted = playthroughs.toSorted((a, b) => b.updatedAt - a.updatedAt);

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Playthroughs</h1>
        <NewPlaythroughButton />
      </div>
      {sorted.length === 0 ? (
        <div className="border-ink flex flex-col items-center gap-3 rounded-2xl border-[3px] border-dashed bg-white/70 px-6 py-12 text-center">
          <BallIcon className="size-16 motion-safe:animate-bounce" />
          <p className="text-xl font-semibold">No playthroughs yet</p>
          <p>
            Pick the game you're playing, then log who joins and leaves your
            team.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {sorted.map((playthrough) => (
            <PlaythroughListItem
              key={playthrough.id}
              playthrough={playthrough}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
