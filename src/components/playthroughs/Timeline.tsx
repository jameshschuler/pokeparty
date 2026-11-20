import { Undo2 } from "lucide-react";
import { usePlaythroughContext } from "../../contexts/playthrough-context";
import { PILL_BUTTON } from "../shared/button-styles";
import { TimelineEntry } from "./TimelineEntry";

export function Timeline() {
  const { events, finalStep, undo } = usePlaythroughContext();

  return (
    <section
      aria-labelledby="timeline-title"
      className="flex max-w-2xl flex-col gap-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="timeline-title" className="text-2xl font-bold">
          Timeline
        </h2>
        <button type="button" onClick={undo} className={PILL_BUTTON}>
          <Undo2 className="size-5" aria-hidden />
          Undo step {finalStep}
        </button>
      </div>
      <p className="text-ink/70 text-sm">Tap a level to fix it.</p>
      <ol className="border-ink shadow-sticker-sm before:bg-ink/15 relative flex max-w-2xl flex-col rounded-2xl border-[3px] bg-white px-3 py-2 before:absolute before:top-6 before:bottom-6 before:left-[25px] before:w-0.5">
        {events.map((event, index) => (
          <TimelineEntry key={`${event.step}-${index}`} event={event} />
        ))}
      </ol>
    </section>
  );
}
