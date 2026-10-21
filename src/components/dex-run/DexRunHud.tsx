import { Heart, Timer } from "lucide-react";
import { useDexRunContext } from "../../contexts/dex-run-context";
import { useNow } from "../../hooks/useNow";
import { DEX_RUN_ANSWER_MS, DEX_RUN_LIVES } from "../../lib/dex-run";
import { CLOCK_TICK_MS, remainingMs } from "../../lib/quiz";

export function DexRunHud() {
  const { run } = useDexRunContext();
  const now = useNow(CLOCK_TICK_MS);
  const remaining = remainingMs(run.clock, now);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-lg font-bold">
        <span
          role="timer"
          aria-label="Time left"
          className="flex items-center gap-1"
        >
          <Timer className="size-5" aria-hidden />
          {Math.ceil(remaining / 1000)}s
        </span>
        <span aria-label="Progress" className="tabular-nums">
          {run.index + 1} / {run.pool.length}
        </span>
        <span
          role="img"
          aria-label={`${run.lives} of ${DEX_RUN_LIVES} lives left`}
          className="flex gap-1"
        >
          {Array.from({ length: DEX_RUN_LIVES }, (_, life) => (
            <Heart
              key={life}
              aria-hidden
              className={`size-5 ${life < run.lives ? "fill-wrong text-wrong" : "text-ink/30"}`}
            />
          ))}
        </span>
      </div>
      <div className="border-ink h-4 overflow-hidden rounded-full border-[3px] bg-white">
        <div
          className="bg-primary h-full transition-[width] duration-100 ease-linear"
          style={{ width: `${(remaining / DEX_RUN_ANSWER_MS) * 100}%` }}
        />
      </div>
    </div>
  );
}
