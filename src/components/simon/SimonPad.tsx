import { useSimonContext } from "../../contexts/simon-context";
import { formatPokemonLabel } from "../../lib/pokemon";
import { useEffect, useState } from "react";
import { expectedIndex, litIndex, SIMON_TAP_FLASH_MS } from "../../lib/simon";
import { PokemonSprite } from "../pokemon/PokemonSprite";
import { simonPadStyle } from "./simon-styles";

type SimonPadProps = {
  index: number;
  onSpriteLoad: () => void;
  onSpriteError: () => void;
};

export function SimonPad({
  index,
  onSpriteLoad,
  onSpriteError,
}: SimonPadProps) {
  const { game, tap } = useSimonContext();
  const pokemon = game.board[index];
  const [presses, setPresses] = useState(0);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (presses === 0) {
      return;
    }

    const timeout = setTimeout(() => setPressed(false), SIMON_TAP_FLASH_MS);

    return () => clearTimeout(timeout);
  }, [presses]);

  const style = simonPadStyle({
    lit: litIndex(game) === index || pressed,
    expected: expectedIndex(game) === index,
    missed: game.missedIndex === index,
  });

  return (
    <button
      type="button"
      onClick={() => {
        setPressed(true);
        setPresses((count) => count + 1);
        tap(index);
      }}
      disabled={game.phase !== "repeat" || game.onHold}
      className={`border-ink shadow-sticker-sm flex w-full touch-manipulation flex-col items-center rounded-2xl border-[3px] p-2 font-semibold transition-[transform,background-color] duration-150 ${style}`}
    >
      <PokemonSprite
        id={pokemon.id}
        shiny={false}
        alt=""
        className="w-20 sm:w-28"
        eager
        onLoad={onSpriteLoad}
        onError={onSpriteError}
      />
      <span className="text-sm leading-tight">
        {formatPokemonLabel(pokemon)}
      </span>
    </button>
  );
}
