import { useMatchContext } from "../../contexts/match-context";
import { describeMatchStatus } from "../../lib/match";
import { MATCH_STATUS_TONES } from "./match-styles";

export function MatchStatus() {
  const { game } = useMatchContext();
  const { text, tone } = describeMatchStatus(game);

  return (
    <p
      aria-live="polite"
      className={`min-h-7 text-center text-lg font-bold ${MATCH_STATUS_TONES[tone]}`}
    >
      {text}
    </p>
  );
}
