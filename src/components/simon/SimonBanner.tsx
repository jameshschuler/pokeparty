import { useSimonContext } from "../../contexts/simon-context";
import { formatPokemonLabel } from "../../lib/pokemon";
import {
  acceptsTap,
  describeSimonBanner,
  litIndex,
  SIMON_IDLE_MS,
} from "../../lib/simon";
import { SIMON_BANNER_STYLES } from "./simon-styles";

export function SimonBanner() {
  const { game } = useSimonContext();
  const { title, detail } = describeSimonBanner(game);
  const lit = litIndex(game);

  return (
    <div
      className={`border-ink shadow-sticker-sm flex min-h-20 flex-col items-center justify-center rounded-2xl border-[3px] px-4 py-2 text-center ${SIMON_BANNER_STYLES[game.phase]}`}
    >
      <p aria-live="polite" className="text-2xl font-bold">
        {title}
        {detail && (
          <span className="block text-lg font-semibold">{detail}</span>
        )}
      </p>
      {acceptsTap(game) && (
        <div
          aria-hidden
          data-countdown
          className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/30"
        >
          <div
            key={`${game.sequence.length}-${game.step}`}
            className="animate-countdown h-full origin-left rounded-full bg-white"
            style={{ animationDuration: `${SIMON_IDLE_MS}ms` }}
          />
        </div>
      )}
      <p className="sr-only" aria-live="assertive">
        {lit === null
          ? ""
          : `${game.step + 1}: ${formatPokemonLabel(game.board[lit])}`}
      </p>
    </div>
  );
}
