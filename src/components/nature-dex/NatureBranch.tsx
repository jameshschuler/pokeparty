import { useNatureDexContext } from "../../contexts/nature-dex-context";
import {
  describeBestMoves,
  type Branch,
  type DexEntry,
} from "../../lib/nature-dex";
import { NatureChip } from "./NatureChip";

type NatureBranchProps = { entry: DexEntry; branch: Branch };

export function NatureBranch({ entry, branch }: NatureBranchProps) {
  const { filters } = useNatureDexContext();
  const evolves = entry.branches.length > 1 || branch.final.name !== entry.name;
  const step = entry.evolutions.find(({ into }) => into === branch.final.name);
  const best = describeBestMoves(branch.best);

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <p className="text-ink/70 text-xs">
        {evolves && (
          <span className="block">
            {entry.branches.length > 1 ? "If it becomes" : "Based on"}{" "}
            <b className="text-ink font-semibold">{branch.final.name}</b>
            {step?.how && ` (${step.how})`}
          </span>
        )}
        {best && <span className="block">{best}</span>}
      </p>
      {branch.picks.length > 0 ? (
        <ol
          aria-label={`Natures for ${branch.final.name}`}
          className="flex flex-wrap gap-1.5"
        >
          {branch.picks.map((pick, rank) => (
            <li key={pick.nature}>
              <NatureChip
                pick={pick}
                top={rank === 0}
                matches={pick.nature === filters.nature}
              />
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-ink/70 max-w-prose text-sm">{branch.note}</p>
      )}
    </div>
  );
}
