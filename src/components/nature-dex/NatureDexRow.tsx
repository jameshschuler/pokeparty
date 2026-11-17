import { ChevronDown, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNatureDexContext } from "../../contexts/nature-dex-context";
import type { DexEntry } from "../../lib/nature-dex";
import { ROLE_LABELS } from "../../lib/natures";
import { formatPokemonNumber } from "../../lib/pokemon";
import { SMALL_BUTTON } from "./nature-dex-styles";
import { HnsSprite } from "./HnsSprite";
import { MoveSheet } from "./MoveSheet";
import { NatureBranch } from "./NatureBranch";
import { TypeBadge } from "./TypeBadge";

export function NatureDexRow({ entry }: { entry: DexEntry }) {
  const { settings, openTabs, setOpenTab } = useNatureDexContext();
  const [flip, setFlip] = useState<{ base: boolean; shiny: boolean }>();
  const shiny = flip?.base === settings.shiny ? flip.shiny : settings.shiny;
  const tab = openTabs.get(entry.dexNumber);
  const roles = [
    ...new Set(entry.branches.map((branch) => ROLE_LABELS[branch.role])),
  ].join(" / ");

  return (
    <article aria-label={entry.name} className="flex flex-col gap-3 p-3">
      <div className="grid grid-cols-[4rem_minmax(0,1fr)_auto] items-start gap-3 md:grid-cols-[4rem_minmax(9rem,1fr)_minmax(0,2.5fr)_auto]">
        <HnsSprite
          dexNumber={entry.dexNumber}
          name={entry.name}
          shiny={shiny}
        />
        <div className="min-w-0">
          <span className="text-ink/60 text-xs font-semibold tabular-nums">
            {formatPokemonNumber(entry.dexNumber)}
          </span>
          <h2 className="truncate text-lg font-bold" title={entry.name}>
            {entry.name}
          </h2>
          <div className="flex flex-wrap gap-1">
            {entry.types.map((type) => (
              <TypeBadge key={type} type={type} />
            ))}
          </div>
          <span className="text-ink/70 mt-1 block text-xs font-semibold tracking-wide uppercase">
            {roles}
          </span>
        </div>
        <div className="col-span-full row-start-2 flex min-w-0 flex-col gap-3 md:col-span-1 md:col-start-3 md:row-start-1">
          {entry.branches.map((branch) => (
            <NatureBranch
              key={branch.final.name}
              entry={entry}
              branch={branch}
            />
          ))}
        </div>
        <div className="col-start-3 row-start-1 flex flex-col items-end gap-2 md:col-start-4">
          <button
            type="button"
            onClick={() => setFlip({ base: settings.shiny, shiny: !shiny })}
            aria-pressed={shiny}
            aria-label={`Show shiny ${entry.name}`}
            title={shiny ? "Show normal" : "Show shiny"}
            className={`${SMALL_BUTTON} ${shiny ? "bg-accent" : "bg-white"}`}
          >
            <Sparkles className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setOpenTab(entry.dexNumber, tab ? null : "level")}
            aria-expanded={!!tab}
            className={`${SMALL_BUTTON} ${tab ? "bg-primary text-white" : "bg-white"}`}
          >
            {tab ? "Hide moves" : "Moves"}
            <ChevronDown
              className={`size-4 transition-transform ${tab ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
        </div>
      </div>
      {tab && <MoveSheet entry={entry} tab={tab} />}
    </article>
  );
}
