import { SIMON_IDLE_MS, SIMON_LEVELS } from "../../lib/simon";
import { BackLink } from "../layout/BackLink";
import { SimonLevelOption } from "./SimonLevelOption";

export function SimonSetup() {
  return (
    <section className="flex flex-col gap-5">
      <BackLink to="/" label="Back" />
      <div>
        <h1 className="text-3xl font-bold">Simon</h1>
        <p className="text-ink/70 mt-1">
          Watch the Pokémon light up, then tap them in the same order. Each
          round adds one more. One wrong tap, or {SIMON_IDLE_MS / 1000} seconds
          without a tap, ends the game.
        </p>
      </div>
      <h2 className="text-xl font-semibold">Pick a level</h2>
      <ul className="grid gap-3" aria-label="Level">
        {SIMON_LEVELS.map((level) => (
          <li key={level}>
            <SimonLevelOption level={level} />
          </li>
        ))}
      </ul>
    </section>
  );
}
