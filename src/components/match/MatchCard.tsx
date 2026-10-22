import { Check } from "lucide-react";
import { useMatchContext } from "../../contexts/match-context";
import { formatPokemonLabel } from "../../lib/pokemon";
import { canFlip, isFaceUp, isMiss } from "../../lib/match";
import { BallIcon } from "../layout/BallIcon";
import { PokemonSprite } from "../pokemon/PokemonSprite";
import { matchFaceStyle } from "./match-styles";

type MatchCardProps = {
  index: number;
  onSpriteLoad: () => void;
  onSpriteError: () => void;
};

export function MatchCard({
  index,
  onSpriteLoad,
  onSpriteError,
}: MatchCardProps) {
  const { game, flip } = useMatchContext();
  const { pokemon, silhouette } = game.cards[index];
  const faceUp = isFaceUp(game, index);
  const matched = game.matched[index];
  const missed = isMiss(game) && game.faceUp.includes(index);
  const name = silhouette
    ? `${formatPokemonLabel(pokemon)}'s silhouette`
    : formatPokemonLabel(pokemon);

  return (
    <button
      type="button"
      onClick={() => flip(index)}
      disabled={!canFlip(game, index)}
      aria-label={
        faceUp ? `${name}${matched ? ", matched" : ""}` : `Card ${index + 1}`
      }
      className={`aspect-square w-full touch-manipulation perspective-midrange ${matched ? "motion-safe:animate-pop" : ""}`}
    >
      <span
        className={`relative block size-full transition-transform duration-300 transform-3d motion-reduce:transition-none ${faceUp ? "rotate-y-180" : ""}`}
      >
        <span className="border-ink bg-primary shadow-sticker-sm absolute inset-0 flex items-center justify-center rounded-2xl border-[3px] backface-hidden">
          <BallIcon className="w-1/2" />
        </span>
        <span
          className={`border-ink shadow-sticker-sm absolute inset-0 flex rotate-y-180 items-center justify-center rounded-2xl border-[3px] p-1 backface-hidden ${matchFaceStyle(matched, missed)}`}
        >
          <PokemonSprite
            id={pokemon.id}
            shiny={false}
            alt=""
            className={`w-full transition-[filter] duration-300 ${silhouette && !matched ? "brightness-0" : ""}`}
            eager
            onLoad={onSpriteLoad}
            onError={onSpriteError}
          />
          {matched && (
            <span className="border-ink bg-correct absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full border-2 text-white">
              <Check className="size-4" strokeWidth={3} aria-hidden />
            </span>
          )}
        </span>
      </span>
    </button>
  );
}
