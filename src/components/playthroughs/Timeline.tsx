import { Undo2 } from "lucide-react";
import { usePlaythroughContext } from "../../contexts/playthrough-context";
import { PILL_BUTTON } from "../shared/button-styles";
import { TimelineEntry } from "./TimelineEntry";

export function Timeline() {
  const { steps, undo } = usePlaythroughContext();

  return (
    <section aria-labelledby="timeline-title" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="timeline-title" className="text-2xl font-bold">
          Timeline
        </h2>
        <button type="button" onClick={undo} className={PILL_BUTTON}>
          <Undo2 className="size-5" aria-hidden />
          Undo step {steps.length}
        </button>
      </div>
      <p className="text-ink/70 text-sm">Tap a level to fix it.</p>
      <ol className="flex flex-col gap-2">
        {steps.map((step) => (
          <TimelineEntry key={step.step} step={step} />
        ))}
      </ol>
    </section>
  );
}
