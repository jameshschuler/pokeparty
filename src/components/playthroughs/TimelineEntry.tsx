import {
  ArrowRight,
  ArrowUp,
  Minus,
  Plus,
  Repeat,
  Sparkles,
} from "lucide-react";
import type { TimelineEvent } from "../../lib/playthrough";
import { ChangeMention } from "./ChangeMention";
import { StintMention } from "./StintMention";
import { TimelineRow } from "./TimelineRow";

const ICON = "size-4";

export function TimelineEntry({ event }: { event: TimelineEvent }) {
  const { step } = event;

  if (event.kind === "swap") {
    return (
      <TimelineRow
        step={step}
        icon={<Repeat className={ICON} strokeWidth={2.5} aria-hidden />}
        badgeClassName="bg-primary text-white"
      >
        <StintMention
          stint={event.left}
          edge="left"
          step={step}
          showVerb={false}
        />
        <ArrowRight className="text-ink/50 size-4 shrink-0" aria-hidden />
        <span className="sr-only">swapped for</span>
        <StintMention
          stint={event.joined}
          edge="joined"
          step={step}
          showVerb={false}
        />
      </TimelineRow>
    );
  }

  if (event.kind === "joined") {
    return (
      <TimelineRow
        step={step}
        icon={<Plus className={ICON} strokeWidth={3} aria-hidden />}
        badgeClassName="bg-primary text-white"
      >
        <StintMention stint={event.stint} edge="joined" step={step} />
      </TimelineRow>
    );
  }

  if (event.kind === "left") {
    return (
      <TimelineRow
        step={step}
        icon={<Minus className={ICON} strokeWidth={3} aria-hidden />}
        badgeClassName="bg-white"
        dimmed
      >
        <StintMention stint={event.stint} edge="left" step={step} />
      </TimelineRow>
    );
  }
  const evolved = event.change.update.pokemonId !== event.change.from;

  return (
    <TimelineRow
      step={step}
      icon={
        evolved ? (
          <Sparkles className={ICON} strokeWidth={2.5} aria-hidden />
        ) : (
          <ArrowUp className={ICON} strokeWidth={3} aria-hidden />
        )
      }
      badgeClassName={evolved ? "bg-accent" : "bg-white"}
    >
      <ChangeMention change={event.change} />
    </TimelineRow>
  );
}
