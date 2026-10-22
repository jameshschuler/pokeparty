import { RefreshCw } from "lucide-react";
import { PILL_BUTTON } from "../shared/button-styles";

export function SpriteLoadFailed({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <p className="font-semibold">Couldn't load these Pokémon.</p>
      <button type="button" onClick={onRetry} className={PILL_BUTTON}>
        <RefreshCw className="size-5" aria-hidden />
        Try other Pokémon
      </button>
    </div>
  );
}
