import { Check, Flame, Timer } from "lucide-react";
import { useQuizContext } from "../../contexts/quiz-context";
import { useNow } from "../../hooks/useNow";
import { clockCapacityMs, CLOCK_TICK_MS, remainingMs } from "../../lib/quiz";

export function QuizHud() {
  const { round, clockSetting } = useQuizContext();
  const now = useNow(CLOCK_TICK_MS);
  const remaining = remainingMs(round.clock, now);
  const { quiz } = round;
  const secondsLeft = Math.ceil(remaining / 1000);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-lg font-bold">
        <span
          role="timer"
          aria-label="Time left"
          className="flex items-center gap-1"
        >
          <Timer className="size-5" aria-hidden />
          {secondsLeft}s
        </span>
        <span className="flex items-center gap-3">
          <span
            role="group"
            aria-label="Correct"
            className="flex items-center gap-1"
          >
            <Check className="size-5" aria-hidden />
            {quiz.correct}
          </span>
          <span
            role="group"
            aria-label="Streak"
            className="flex items-center gap-1"
          >
            <Flame className="size-5" aria-hidden />
            {quiz.streak}
          </span>
        </span>
      </div>
      <div className="border-ink h-4 overflow-hidden rounded-full border-[3px] bg-white">
        <div
          className="bg-primary h-full transition-[width] duration-100 ease-linear"
          style={{
            width: `${(remaining / clockCapacityMs(clockSetting)) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
