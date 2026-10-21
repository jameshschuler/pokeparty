import { useRoundContext } from "../../contexts/round-context";
import { formatPokemonNumber } from "../../lib/pokemon";

export function DexNumber() {
  const { question, shown } = useRoundContext();

  return (
    <p
      aria-label="Dex number"
      className="text-primary py-2 text-5xl font-bold tabular-nums sm:py-6 sm:text-6xl"
    >
      {shown ? formatPokemonNumber(question.answer.speciesId) : "#????"}
    </p>
  );
}
