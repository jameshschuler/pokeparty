import { HNS_DEX_SIZE } from "../../lib/nature-dex";
import { NatureChart } from "./NatureChart";
import { NatureDexControls } from "./NatureDexControls";
import { NatureDexList } from "./NatureDexList";
import { NatureTips } from "./NatureTips";

export function NatureDex() {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold">Nature Dex</h1>
        <p className="text-ink/70 mt-1 max-w-prose">
          The best natures and full move lists for all {HNS_DEX_SIZE} Pokémon in
          Pokémon Heart &amp; Soul v2.0.6. Natures carry over when a Pokémon
          evolves, so each pick is based on what it evolves into. Stats, moves
          and locations come from the{" "}
          <a
            href="https://heartsoulgame.com/"
            target="_blank"
            rel="noopener"
            className="font-semibold underline underline-offset-4"
          >
            official H&amp;S documentation
          </a>
          . The nature picks are a rule applied to that data, not an official
          list.
        </p>
      </div>
      <NatureDexControls />
      <NatureDexList />
      <div className="grid gap-4 lg:grid-cols-2">
        <NatureChart />
        <NatureTips />
      </div>
    </section>
  );
}
