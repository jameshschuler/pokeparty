import { MATCH_LEVELS } from "../../lib/match";
import { BackLink } from "../layout/BackLink";
import { MatchLevelOption } from "./MatchLevelOption";

export function MatchSetup() {
  return (
    <section className="flex flex-col gap-5">
      <BackLink to="/" label="Back" />
      <div>
        <h1 className="text-3xl font-bold">Pokémon Match</h1>
        <p className="text-ink/70 mt-1">
          Flip two cards at a time to find every pair. Fewer flips wins, then
          the faster time.
        </p>
      </div>
      <h2 className="text-xl font-semibold">Pick a level</h2>
      <ul className="grid gap-3" aria-label="Level">
        {MATCH_LEVELS.map((level) => (
          <li key={level}>
            <MatchLevelOption level={level} />
          </li>
        ))}
      </ul>
    </section>
  );
}
