import { useDexRunContext } from "../../contexts/dex-run-context";
import { describeDexAnswer, isRevealed } from "../../lib/dex-run";
import { DexNumber } from "../game/DexNumber";

export function DexRunPrompt() {
  const { run } = useDexRunContext();

  return (
    <div className="border-ink shadow-sticker flex flex-col items-center rounded-3xl border-[3px] bg-white p-4">
      <DexNumber />
      <p
        className="flex min-h-8 items-center justify-center text-center text-xl font-bold"
        aria-live="polite"
      >
        {isRevealed(run) ? (
          describeDexAnswer(run)
        ) : (
          <span className="text-ink/70">Which Pokémon is this?</span>
        )}
      </p>
    </div>
  );
}
