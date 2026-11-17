import {
  attackCategory,
  sharedRole,
  type DexEntry,
  type MoveTab,
} from "../../lib/nature-dex";
import { ROLE_LABELS } from "../../lib/natures";
import { HNS_SPECIES_BY_NAME } from "../../lib/nature-dex-data";
import { CatchLocations } from "./CatchLocations";
import { MoveTable } from "./MoveTable";
import { MoveTabs } from "./MoveTabs";

type MoveSheetProps = { entry: DexEntry; tab: MoveTab };

export function MoveSheet({ entry, tab }: MoveSheetProps) {
  const role = sharedRole(entry.branches);
  const fitCategory = role && attackCategory(role);
  const evolutions = entry.evolutions.filter(({ into }) =>
    HNS_SPECIES_BY_NAME.has(into),
  );

  return (
    <div className="flex flex-col gap-3 md:pl-19">
      <div className="text-ink/70 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span>
          Abilities:{" "}
          <b className="text-ink font-semibold">
            {entry.abilities.join(" / ")}
          </b>
          {entry.hiddenAbilities.length > 0 && (
            <>
              {" · Hidden: "}
              <b className="text-ink font-semibold">
                {entry.hiddenAbilities.join(" / ")}
              </b>
            </>
          )}
        </span>
        {evolutions.map(({ into, how }) => (
          <span key={into}>
            Evolves into <b className="text-ink font-semibold">{into}</b>
            {how && ` · ${how}`}
          </span>
        ))}
      </div>
      <MoveTabs entry={entry} tab={tab} />
      {tab === "where" ? (
        <CatchLocations locations={entry.locations} />
      ) : (
        <>
          <MoveTable entry={entry} tab={tab} fitCategory={fitCategory} />
          <p className="text-ink/70 text-xs">
            Bold moves get STAB (same type as {entry.name}).{" "}
            {role &&
              fitCategory &&
              `Green categories match its role (${ROLE_LABELS[role].toLowerCase()} attacker). `}
            Categories follow your split setting. Its evolutions can have
            different moves.
          </p>
        </>
      )}
    </div>
  );
}
