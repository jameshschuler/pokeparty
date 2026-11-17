import type { NaturePick } from "../../lib/nature-dex";
import { NATURES, STAT_LABELS } from "../../lib/natures";

type NatureChipProps = { pick: NaturePick; top: boolean; matches: boolean };

export function NatureChip({ pick, top, matches }: NatureChipProps) {
  const [up, down] = NATURES[pick.nature];

  return (
    <div
      className={`border-ink flex min-w-0 flex-col rounded-xl border-2 px-2 py-1 ${top ? "bg-accent/40" : "bg-white"} ${matches ? "outline-primary outline-2 outline-offset-1" : ""}`}
    >
      <span className="text-sm font-bold">{pick.nature}</span>
      <span className="text-xs font-semibold tabular-nums">
        <span className="text-correct">+{STAT_LABELS[up]}</span>{" "}
        <span className="text-wrong">−{STAT_LABELS[down]}</span>
      </span>
      <span className="text-ink/70 text-xs">{pick.reason}</span>
    </div>
  );
}
