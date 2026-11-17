import { useNatureDexContext } from "../../contexts/nature-dex-context";
import {
  MOVE_CATEGORY_LABELS,
  moveCategory,
  moveList,
  type DexEntry,
  type MoveListTab,
} from "../../lib/nature-dex";
import { HNS_MOVES, type MoveCategory } from "../../lib/nature-dex-data";
import { TypeBadge } from "./TypeBadge";

type MoveTableProps = {
  entry: DexEntry;
  tab: MoveListTab;
  fitCategory: MoveCategory | null;
};

const HEADING =
  "bg-surface sticky top-0 px-2 py-1 text-left text-xs font-bold tracking-wide uppercase";

export function MoveTable({ entry, tab, fitCategory }: MoveTableProps) {
  const { settings } = useNatureDexContext();
  const moves = moveList(entry, tab, settings);

  if (moves.length === 0) {
    return <p className="text-ink/70 text-sm">No moves in this list.</p>;
  }

  return (
    <div className="border-ink/20 max-h-96 overflow-auto rounded-xl border-2">
      <table className="w-full min-w-md border-collapse text-sm">
        <thead>
          <tr>
            <th className={HEADING}>
              <span className="sr-only">Learned</span>
            </th>
            <th className={HEADING}>Move</th>
            <th className={HEADING}>Type</th>
            <th className={HEADING}>Category</th>
            <th className={`${HEADING} text-right`}>Pow</th>
            <th className={`${HEADING} text-right`}>Acc</th>
          </tr>
        </thead>
        <tbody>
          {moves.map(({ label, moveId }, index) => {
            const move = HNS_MOVES[moveId];
            const category = moveCategory(move, settings);
            const stab =
              category !== "status" && entry.types.includes(move.type);

            return (
              <tr
                key={`${label}-${moveId}-${index}`}
                className="border-ink/10 border-t-2 whitespace-nowrap"
              >
                <td className="text-ink/60 w-14 px-2 py-1 text-xs tabular-nums">
                  {label}
                </td>
                <td className={`px-2 py-1 ${stab ? "font-bold" : ""}`}>
                  {move.name}
                </td>
                <td className="px-2 py-1">
                  <TypeBadge type={move.type} />
                </td>
                <td
                  className={`px-2 py-1 ${category === fitCategory ? "text-correct font-bold" : ""}`}
                >
                  {MOVE_CATEGORY_LABELS[category]}
                </td>
                <td className="px-2 py-1 text-right tabular-nums">
                  {move.power > 1 ? move.power : "—"}
                </td>
                <td className="px-2 py-1 text-right tabular-nums">
                  {move.accuracy || "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
