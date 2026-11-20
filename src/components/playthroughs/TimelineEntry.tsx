import type { TimelineStep } from "../../lib/playthrough";
import { ChangeLine } from "./ChangeLine";
import { StintLine } from "./StintLine";

export function TimelineEntry({ step }: { step: TimelineStep }) {
  return (
    <li className="border-ink flex gap-3 rounded-2xl border-[3px] bg-white p-3">
      <span className="border-ink bg-accent flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold">
        {step.step}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {step.left.map((stint) => (
          <StintLine key={stint.id} stint={stint} edge="left" />
        ))}
        {step.changed.map((change) => (
          <ChangeLine key={change.stint.id} change={change} />
        ))}
        {step.joined.map((stint) => (
          <StintLine key={stint.id} stint={stint} edge="joined" />
        ))}
      </div>
    </li>
  );
}
