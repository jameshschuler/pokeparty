import {
  DEX_RANGES,
  DEX_RUN_ANSWER_MS,
  DEX_RUN_LIVES,
} from "../../lib/dex-run";
import { BackLink } from "../layout/BackLink";
import { DexRangeOption } from "./DexRangeOption";

export function DexRunSetup() {
  return (
    <section className="flex flex-col gap-5">
      <BackLink to="/" label="Back" />
      <div>
        <h1 className="text-3xl font-bold">Dex Run</h1>
        <p className="text-ink/70 mt-1">
          Name every Pokémon in dex order. You have {DEX_RUN_LIVES} lives and{" "}
          {DEX_RUN_ANSWER_MS / 1000} seconds for each number.
        </p>
      </div>
      <h2 className="text-xl font-semibold">Pick a dex</h2>
      <ul className="grid gap-3 sm:grid-cols-2" aria-label="Dex">
        {DEX_RANGES.map((range) => (
          <li
            key={range}
            className={range === "national" ? "sm:col-span-2" : ""}
          >
            <DexRangeOption range={range} />
          </li>
        ))}
      </ul>
    </section>
  );
}
