import { useSimonContext } from "../../contexts/simon-context";
import { formatPokemonLabel } from "../../lib/pokemon";
import { expectedIndex, litIndex } from "../../lib/simon";
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
  const style = simonPadStyle({
    lit: litIndex(game) === index,
    expected: expectedIndex(game) === index,
    missed: game.missedIndex === index,
  });

  return (
    <button
      type="button"
      onClick={() => tap(index)}
      disabled={game.phase !== "repeat" || game.onHold}
      className={`border-ink flex w-full flex-col items-center rounded-2xl border-[3px] p-2 font-semibold transition duration-150 ${style}`}
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
